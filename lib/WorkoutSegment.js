"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Interval = exports.SteadyState = exports.FailedWorkoutSegement = exports.WorkoutSegment = void 0;
const utils_1 = require("./utils");
class WorkoutSegment {
    tag;
    attributes;
    constructor(tag, attributes) {
        this.tag = tag;
        this.attributes = attributes;
    }
    toXML(indentation) {
        const _ = utils_1.makeIndentationString(indentation);
        const _attributes = Object.entries(this.attributes)
            .filter(([_, value]) => value !== null)
            .map(([key, value]) => `${key}="${value}"`)
            .join(" ");
        return `${_}<${this.tag} ${_attributes}/>`;
    }
    static fromString(str) {
        try {
            if (str.includes("组：")) {
                return Interval.$fromString(str) ?? FailedWorkoutSegement.shared;
            }
            else {
                return SteadyState.$fromString(str) ?? FailedWorkoutSegement.shared;
            }
        }
        catch (e) {
            return FailedWorkoutSegement.shared;
        }
    }
}
exports.WorkoutSegment = WorkoutSegment;
class FailedWorkoutSegement extends WorkoutSegment {
    constructor() {
        super("", {});
    }
    toXML(indentation) {
        const _ = utils_1.makeIndentationString(indentation);
        return `${_}<!-- failed to parse -->`;
    }
    static shared = new FailedWorkoutSegement();
}
exports.FailedWorkoutSegement = FailedWorkoutSegement;
class SteadyState extends WorkoutSegment {
    Duration;
    Power;
    Cadence;
    constructor(Duration, Power, Cadence = null, pace = 0) {
        super("SteadyState", {
            Duration,
            Power,
            Cadence,
            pace,
        });
        this.Duration = Duration;
        this.Power = Power;
        this.Cadence = Cadence;
    }
    static $fromString(str) {
        const match = this.regex.exec(str);
        if (null === match)
            return null;
        const duration = parseFloat(match[1]);
        const durationMultiplier = match[2] === "秒" ? 1 : 60;
        const power = parseInt(match[3]);
        const cadence = match[4] ? parseInt(match[4]) : null;
        return new SteadyState(duration * durationMultiplier, power / 100, cadence);
    }
    static regex = /(\d+(?:\.\d+)?)(分钟|秒)(\d+)%(?:[(（](\d+)rpm[)）])?/;
}
exports.SteadyState = SteadyState;
class Interval extends WorkoutSegment {
    constructor(Repeat, OnDuration, OffDuration, OnPower, OffPower, Cadence = null, CadenceResting = null, pace = 0) {
        super("IntervalsT", {
            Repeat,
            OnDuration,
            OffDuration,
            OnPower,
            OffPower,
            Cadence,
            CadenceResting,
            pace,
        });
    }
    static $fromString(str) {
        const match = this.regex.exec(str);
        if (match === null)
            return null;
        const repeat = this.parseChineseNumberLiteral(match[1]);
        const onSegment = SteadyState.$fromString(match[2]);
        const offSegment = SteadyState.$fromString(match[3]);
        if (onSegment === null) {
            throw utils_1.makeError(`${match[2]} in ${str}`);
        }
        if (offSegment === null) {
            throw utils_1.makeError(`${match[3]} in ${str}`);
        }
        return new Interval(repeat, onSegment.Duration, offSegment.Duration, onSegment.Power, offSegment.Power, onSegment.Cadence, offSegment.Cadence);
    }
    static regex = /(.*?)组：(.*?)\+(.*)/;
    static numberTable = {
        一: 1,
        二: 2,
        三: 3,
        四: 4,
        五: 5,
        六: 6,
        七: 7,
        八: 8,
        九: 9,
        十: 10,
    };
    static parseChineseNumberLiteral(str) {
        if (str.length > 2) {
            throw utils_1.makeError(str);
        }
        if (!(str[0] in this.numberTable)) {
            throw utils_1.makeError(str);
        }
        if (str.length === 1) {
            return this.numberTable[str[0]];
        }
        if (!(str[1] in this.numberTable)) {
            throw utils_1.makeError(str);
        }
        const tens = this.numberTable[str[0]];
        const unit = this.numberTable[str[1]];
        return tens * (tens === 10 ? 1 : 10) + unit * (unit === 10 ? 0 : 1);
    }
}
exports.Interval = Interval;
