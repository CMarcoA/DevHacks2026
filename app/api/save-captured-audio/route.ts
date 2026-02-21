import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { saveJson } from "@/backend/logic.js";

export const runtime = "nodejs";

const sanitizeFileName = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const contextRaw = formData.get("context");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
    }

    let context = null;
    if (typeof contextRaw === "string" && contextRaw.trim()) {
      try {
        context = JSON.parse(contextRaw);
      } catch {
        return NextResponse.json({ error: "Invalid context JSON payload." }, { status: 400 });
      }
    }

    const audioFilesDir = path.join(process.cwd(), "audioFiles");
    await mkdir(audioFilesDir, { recursive: true });

    const safeName = sanitizeFileName(file.name || "capture-audio.webm");
    const outputPath = path.join(audioFilesDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(outputPath, Buffer.from(bytes));

    const result = await saveJson(outputPath, context);
    
    return NextResponse.json({
      ok: true,
      fileName: safeName,
      storedAt: `audioFiles/${safeName}`,
      outputFile: result.outputFile,
      aiData: result.json,
    });
  } catch (error) {
    console.error("save-audio route failed:", error);
    const message =
      error instanceof Error ? error.message : "Unable to save audio file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}