"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const fs_1 = __importDefault(require("fs"));
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const Workout_1 = require("./Workout");
const WorkoutFile_1 = require("./WorkoutFile");
const WorkoutSegment_1 = require("./WorkoutSegment");
async function run({ pdfFilePath, author, name, description }) {
    const pdfText = await readPDFText(pdfFilePath);
    const workoutStrings = extractWorkoutStrings(dedupe(pdfText));
    const failedDays = [];
    const workoutFiles = workoutStrings.map((str, i) => {
        const segements = str.trim().split("\n").map(WorkoutSegment_1.WorkoutSegment.fromString);
        const containsFailure = segements.includes(WorkoutSegment_1.FailedWorkoutSegement.shared);
        const dayNumber = i + 1;
        if (containsFailure)
            failedDays.push(dayNumber);
        const workout = new Workout_1.Workout(segements);
        return new WorkoutFile_1.WorkoutFile(author, `${name} - Day ${dayNumber}`, description, workout);
    });
    await Promise.all(workoutFiles.map(writeWorkoutFile));
    return failedDays;
}
exports.run = run;
function writeWorkoutFile(file) {
    return fs_1.default.promises.writeFile(`./output/${file.name}.zwo`, file.toXML(0), "utf8");
}
async function readPDFText(pdfFilePath) {
    const buffer = await fs_1.default.promises.readFile(pdfFilePath);
    return (await pdf_parse_1.default(buffer)).text;
}
function extractWorkoutStrings(text) {
    const workouts = [];
    const startingAnchor = "训练：";
    const endingAnchor = "理论体感";
    text = text.replace(/\n/g, "");
    let i = text.search(startingAnchor);
    while (i >= 0 && i < text.length) {
        let j = text.search(endingAnchor);
        if (j < 0)
            j = text.length;
        workouts.push(text.substring(i + startingAnchor.length, j));
        text = text.substr(j + endingAnchor.length);
        i = text.search(startingAnchor);
    }
    return workouts.map((workout) => {
        return workout
            .replace(/%/g, "%\n")
            .replace(/\n\+/g, "+")
            .replace(/\n\(/g, "(")
            .replace(/\)(\d)/g, ")\n$1");
    });
}
function dedupe(text) {
    const lines = text.split("\n");
    let i = 0;
    let j = 1;
    const removals = [];
    for (let i = 0, j = 1; j < lines.length; j++) {
        if (lines[i] == lines[j]) {
            removals.push(j);
        }
        else {
            i = j;
        }
    }
    return lines.filter((_, i) => !removals.includes(i)).join("\n");
}
