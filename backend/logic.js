// app/api/process-voice-ai/route.ts
import { processInput } from '@/backend/openai';
import { project } from '@/backend/data';

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get('file'); // Yes, this is a 'File' object type

  // Call the "Service" (Logic Layer)
  const rawAiData = await processInput(file);

  // Call the "Model" (Data Layer) to create the instance
  const cleanProject = project(rawAiData);

  // Return to Frontend
  return Response.json(cleanProject);
}