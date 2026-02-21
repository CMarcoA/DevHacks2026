
import { OpenAI } from 'openai';

export default async function processInput(audioFile) {
  const openai = new OpenAI();
  
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
        content: `Extract project details into JSON. it will contain
        a project id and team members and in each id there will be a "checkpoint" where each checkpoint will show the to do list for each member 
        Format: { "projectId": int, "teamMembers": string array, "checkpoints": [{ "assignedTo": string (team members name), "todos": string[] }] }
        if any of the details are missing, just put empty string or empty array.`
      },
      { role: "user", content: transcription.text }
    ],
    response_format: { type: "json_object" }
  });
  //console.log(json);
  return JSON.parse(json.choices[0].message.content);
}