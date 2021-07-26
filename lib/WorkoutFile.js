"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkoutFile = void 0;
class WorkoutFile {
    author;
    name;
    description;
    workout;
    constructor(author, name, description = "", workout) {
        this.author = author;
        this.name = name;
        this.description = description;
        this.workout = workout;
    }
    toXML(indentation) {
        return `
<workout_file>
    <author>${this.author}</author>
    <name>${this.name}</name>
    <description>${this.description}</description>
    <sportType>bike</sportType>
    <tags/>
${this.workout.toXML(1)}
</workout_file>
    `.trim();
    }
}
exports.WorkoutFile = WorkoutFile;
