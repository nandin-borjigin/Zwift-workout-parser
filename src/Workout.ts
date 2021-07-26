import { WorkoutSegment } from "./WorkoutSegment";
import { XMLPart } from "./XMLPart";
import { makeIndentationString } from "./utils";


export class Workout implements XMLPart {
  constructor(private segments: WorkoutSegment[]) { }

  toXML(indentation: number): string {
    const _ = makeIndentationString(indentation);
    const _segments = this.segments
      .map((seg) => seg.toXML(indentation + 1))
      .join("\n");
    return `${_}<workout>\n${_segments}\n${_}</workout>`;
  }
}
