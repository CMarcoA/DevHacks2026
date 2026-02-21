import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import path from 'path';
import processInput from './openai/processInput.js'

/*
 this is the function that will take the input file and put into the AI 
 to be processed and save as a json file with project(projectID).json name
*/ 
export async function saveJson(input) {
  //const inputPath = path.join(process.cwd(), 'input');
  const outputPath = path.join(process.cwd(), 'output');

  //const input = path.join(inputPath, 'input2.m4a');

  try {
    console.log(`Processing: ${input}`);
    const audioStream = fs.createReadStream(input);
    const json = await processInput(audioStream);
    const files = fs.readdirSync(outputPath);
    
    /* 
    this part is for when user didn't specify the project number. by default the AI will defaulted to project id 1 if the project number
    is not specified. so my idea is read the file names in the output folder and extract the number because i saved it as project1, project2, etc
    */
    const numbers = files
      .map(f => {
        const match = f.match(/project(\d+)\.json/); // use regex to look for the digit in the file name
        return parseInt(match[1]); 
      })

    // if the folder is empty then just use 1 else the found highest number + 1
    const nextId =  Math.max(...numbers) + 1;
    
    json.projectId = nextId;
    const output = `project${nextId}.json`;
    fs.writeFileSync(
      path.join(outputPath, output),
      JSON.stringify(json, null, 2)
    );
    console.log("the file has been saved");
  } catch (error) {
    console.log("error processing file");
  }
}

/*
 this is the function that will overwrite any task for each member if the user wishes to
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

//overwriteTask(1, "Marco", "buy food for patrick");