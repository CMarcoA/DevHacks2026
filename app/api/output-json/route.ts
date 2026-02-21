import { NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";

const sanitizeOutputFile = (value: string): string =>
  value.replace(/[^a-zA-Z0-9._-]/g, "_");

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const file = url.searchParams.get("file");
    if (!file) {
      return NextResponse.json({ error: "Missing output file name." }, { status: 400 });
    }

    const safeFile = sanitizeOutputFile(file);
    const filePath = path.join(process.cwd(), "output", safeFile);
    const content = await readFile(filePath, "utf-8");
    const parsed = JSON.parse(content);
    return NextResponse.json({ file: safeFile, data: parsed });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to read output file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const file = typeof body?.file === "string" ? body.file : "";
    const data = body?.data;
    if (!file || !data) {
      return NextResponse.json({ error: "Missing file or data payload." }, { status: 400 });
    }

    const safeFile = sanitizeOutputFile(file);
    const filePath = path.join(process.cwd(), "output", safeFile);
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
    return NextResponse.json({ ok: true, file: safeFile });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save output file.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
