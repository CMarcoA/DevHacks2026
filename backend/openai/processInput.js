
import { OpenAI } from "openai";

export async function processInput(audioFile, context = null) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local and restart the dev server.");
  }

  const openai = new OpenAI({ apiKey });
  const teammates = Array.isArray(context?.teammates) ? context.teammates : [];
  const teammateLines = teammates
    .map((member) => `- ${member.name}${member.position ? ` (${member.position})` : ""}`)
    .join("\n");
  const contextBlock = teammates.length
    ? `Project context:\nprojectId: ${context?.projectId ?? ""}\nprojectName: ${context?.projectName ?? ""}\nTeammates:\n${teammateLines}`
    : "Project context: not provided";
  
  // using the 4o-mini-transcribe model to transcribe the audio file
  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "gpt-4o-mini-transcribe",
  });

  //console.log(transcription);

  // using the 4o-mini to process the transcribed audio and output a clean json format file 
  const json = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `Extract project details into JSON.
Format: { "projectId": int|string, "teamMembers": string[], "checkpoints": [{ "assignedTo": string, "todos": string[] }] }.
If teammate context is provided, assignedTo MUST be one of the teammate names exactly as listed.
Do not invent new names. If a task has no clear owner, set "assignedTo" to an empty string.
If details are missing, use empty string or empty arrays.`
      },
      {
        role: "user",
        content: `${contextBlock}\n\nTranscription:\n${transcription.text}`,
      }
    ],
    response_format: { type: "json_object" }
  });
  //console.log(json);
  return JSON.parse(json.choices[0].message.content);
}

export default processInput;