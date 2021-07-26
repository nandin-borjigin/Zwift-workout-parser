"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Workout = void 0;
const utils_1 = require("./utils");
class Workout {
    segments;
    constructor(segments) {
        this.segments = segments;
    }
    toXML(indentation) {
        const _ = utils_1.makeIndentationString(indentation);
        const _segments = this.segments
            .map((seg) => seg.toXML(indentation + 1))
            .join("\n");
        return `${_}<workout>\n${_segments}\n${_}</workout>`;
    }
}
exports.Workout = Workout;
