import dotenv from "dotenv";
dotenv.config();
import fs from "fs";
import path from "path";
import processInput from "./openai/processInput.js";

// this is the function that will take the input file and put into the AI 
// to be processed and save as a json file with project(projectID).json name
export async function saveJson(input, context = null) {
  //const inputPath = path.join(process.cwd(), 'input');
  const outputPath = path.join(process.cwd(), "output");

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  //const input = path.join(inputPath, 'input2.m4a');

  try {
    console.log(`Processing: ${input}`);
    const audioStream = fs.createReadStream(input);
    const json = await processInput(audioStream, context);
    const rawId =
      typeof json?.projectId === "string" || typeof json?.projectId === "number"
        ? String(json.projectId).trim()
        : "";
    const fallbackId = `unknown-${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const id = rawId || fallbackId;
    const output = `project${id}.json`;
    const outputFilePath = path.join(outputPath, output);
    fs.writeFileSync(outputFilePath, JSON.stringify(json, null, 2));
    console.log(`the file has been saved: ${outputFilePath}`);
    return { json, outputFile: output };
  } catch (error) {
    console.error("error processing file", error);
    throw error;
  }
}

/*
 this is the function that will overwrite any task for each member
 if the user wishes to

 takes the argument of the projectID , the name of the member in that project and the new task that will be assigned
*/ 

export function overwriteTask(projectId, memberName, newTodos) {
  
  const filePath = path.join(process.cwd(), 'output', `project${projectId}.json`);

  try {
    
    // read and parse the file
    const Json = fs.readFileSync(filePath, 'utf-8');
    const project = JSON.parse(Json);

    // find the specific member in the assigned to array
    const checkpoint = project.checkpoints.find(c => c.assignedTo === memberName);

    if (checkpoint) {
      // overwrite the old todos with the new one
      checkpoint.todos = Array.isArray(newTodos) ? newTodos : [newTodos];
      
      // and save it back
      fs.writeFileSync(filePath, JSON.stringify(project, null, 2));
      console.log(`Successfully updated tasks for ${memberName}`);
      
    } else {
      console.error(`Member ${memberName} not found in project checkpoints.`);
      return;
    }
  } catch (err) {
    console.error("Error updating JSON:", err);
    return;
  }
}
