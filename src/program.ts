import fs from "fs";
import pdf from "pdf-parse";
import { Workout } from "./Workout";
import { WorkoutFile } from "./WorkoutFile";
import { WorkoutSegment } from "./WorkoutSegment";

export interface Options {
  pdfFilePath: string;
  author: string;
  name: string;
  description: string;
}

export async function run({ pdfFilePath, author, name, description }: Options) {
  const pdfText = await readPDFText(pdfFilePath);
  const workoutStrings = extractWorkoutStrings(dedupe(pdfText));
  const workoutFiles = workoutStrings.map((str, i) => {
    return new WorkoutFile(
      author,
      `${name} - Day ${i + 1}`,
      description,
      new Workout(str.trim().split("\n").map(WorkoutSegment.fromString))
    );
  });
  await Promise.all(
    workoutFiles.map((file) => {
      return fs.promises.writeFile(
        `./output/${file.name}.zwo`,
        file.toXML(0),
        "utf8"
      );
    })
  );
}

async function readPDFText(pdfFilePath: string): Promise<string> {
  const buffer = await fs.promises.readFile(pdfFilePath);
  return (await pdf(buffer)).text;
}

function extractWorkoutStrings(text: string) {
  const workouts: string[] = [];
  const startingAnchor = "训练：";
  const endingAnchor = "理论体感";
  text = text.replace(/\n/g, "");
  let i = text.search(startingAnchor);
  while (i >= 0 && i < text.length) {
    let j = text.search(endingAnchor);
    if (j < 0) j = text.length;
    workouts.push(text.substring(i + startingAnchor.length, j));
    text = text.substr(j + endingAnchor.length);
    i = text.search(startingAnchor);
  }

  return workouts.map((workout) => {
    return workout.replace(/%/g, "%\n").replace(/\n\+/g, "+").replace(/\n\(/g, "(").replace(/\)(\d)/g, ")\n$1");
  });
}

function dedupe(text: string) {
  const lines = text.split("\n");
  let i = 0;
  let j = 1;
  const removals: number[] = [];
  for (let i = 0, j = 1; j < lines.length; j++) {
    if (lines[i] == lines[j]) {
      removals.push(j);
    } else {
      i = j;
    }
  }
  return lines.filter((_, i) => !removals.includes(i)).join("\n");
}

