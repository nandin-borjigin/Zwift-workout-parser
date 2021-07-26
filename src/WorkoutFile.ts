import { Workout } from "./Workout";
import { XMLPart } from "./XMLPart";

export class WorkoutFile implements XMLPart {
  constructor(
    private author: string,
    public name: string,
    private description: string = "",
    private workout: Workout
  ) { }

  toXML(indentation: number): string {
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
