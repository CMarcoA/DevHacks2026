
import { OpenAI } from 'openai';
const openai = new OpenAI();

export async function processInput(audioFile) {
  // 1. Whisper Transcription
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "gpt-4o-mini-transcribe",
  });

  // 2. Structured JSON Extraction (Matching your new model)
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { 
        role: "system", 
        content: `Extract project details into JSON. it will contain
        a project id and team members and in each id there will be a "checkpoint" where each checkpoint will show the to do list for each member 
        Format: { "id": int, "teamMembers": string array, "checkpoints": [{ "assignedTo": string (team members name), "todos": string[] }] }
        if any of the details are missing, just put empty string or empty array. don't include any \`\`\`json word just make the structure like i state above`
      },
      { role: "user", content: transcription.text }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(completion.choices[0].message.content);
}