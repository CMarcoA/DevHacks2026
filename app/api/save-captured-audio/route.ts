import { NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const sanitizeFileName = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
    }

    const audioFilesDir = path.join(process.cwd(), "audioFiles");
    await mkdir(audioFilesDir, { recursive: true });

    const safeName = sanitizeFileName(file.name || "capture-audio.webm");
    const outputPath = path.join(audioFilesDir, safeName);

    const bytes = await file.arrayBuffer();
    await writeFile(outputPath, Buffer.from(bytes));

    return NextResponse.json({
      ok: true,
      fileName: safeName,
      storedAt: `audioFiles/${safeName}`,
    });
  } catch (error) {
    console.error("save-audio route failed:", error);
    return NextResponse.json({ error: "Unable to save audio file." }, { status: 500 });
  }
}
