import { projectModel } from "@/backend/data/project.js";
import { processInput } from "@/backend/openai/processInput.js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing audio file." }, { status: 400 });
    }

    const rawAiData = await processInput(file);
    const cleanProject = projectModel(rawAiData);

    return NextResponse.json(cleanProject);
  } catch (error) {
    console.error("process-voice route failed:", error);
    const message =
      error instanceof Error ? error.message : "Unable to process voice input.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
