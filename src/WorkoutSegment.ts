import { XMLPart } from "./XMLPart";
import { makeError, makeIndentationString } from "./utils";

export class WorkoutSegment implements XMLPart {
  protected constructor(private tag: string, private attributes: Record<string, any>) { }

  toXML(indentation: number): string {
    const _ = makeIndentationString(indentation);
    const _attributes = Object.entries(this.attributes)
      .filter(([_, value]) => value !== null)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");
    return `${_}<${this.tag} ${_attributes}/>`;
  }

  static fromString(str: string): WorkoutSegment {
    let segment: WorkoutSegment | null = null;
    if (str.includes("组：")) {
      segment = Interval.$fromString(str);
    } else {
      segment = SteadyState.$fromString(str);
    }
    if (segment === null) {
      throw makeError(str);
    }
    return segment;
  }
}

export class SteadyState extends WorkoutSegment {
  constructor(
    public Duration: number,
    public Power: number,
    public Cadence: number | null = null,
    pace: number = 0
  ) {
    super("SteadyState", {
      Duration,
      Power,
      Cadence,
      pace,
    });
  }

  static $fromString(str: string): SteadyState | null {
    const match = this.regex.exec(str);
    if (null === match) return null;
    const duration = parseInt(match[1]);
    const durationMultiplier = match[2] === "秒" ? 1 : 60;
    const power = parseInt(match[3]);
    const cadence = match[4] ? parseInt(match[4]) : null;
    return new SteadyState(duration * durationMultiplier, power / 100, cadence);
  }
  private static regex = /(\d+)(分钟|秒)(\d+)%(?:[(（](\d+)rpm[)）])?/;
}

export class Interval extends WorkoutSegment {
  constructor(
    Repeat: number,
    OnDuration: number,
    OffDuration: number,
    OnPower: number,
    OffPower: number,
    Cadence: number | null = null,
    CadenceResting: number | null = null,
    pace: number = 0
  ) {
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

  static $fromString(str: string): Interval | null {
    const match = this.regex.exec(str);
    if (match === null) return null;
    const repeat = this.parseChineseNumberLiteral(match[1]);
    const onSegment = SteadyState.$fromString(match[2]);
    const offSegment = SteadyState.$fromString(match[3]);
    if (onSegment === null) {
      throw makeError(`${match[2]} in ${str}`);
    }
    if (offSegment === null) {
      throw makeError(`${match[3]} in ${str}`);
    }
    return new Interval(
      repeat,
      onSegment.Duration,
      offSegment.Duration,
      onSegment.Power,
      offSegment.Power,
      onSegment.Cadence,
      offSegment.Cadence
    );
  }

  private static regex = /(.*?)组：(.*?)\+(.*)/;

  private static numberTable: Record<string, number> = {
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

  private static parseChineseNumberLiteral(str: string) {
    if (str.length > 2) {
      throw makeError(str);
    }
    if (!(str[0] in this.numberTable)) {
      throw makeError(str);
    }
    if (str.length === 1) {
      return this.numberTable[str[0]];
    }
    if (!(str[1] in this.numberTable)) {
      throw makeError(str);
    }
    const tens = this.numberTable[str[0]];
    const unit = this.numberTable[str[1]];
    return tens * (tens === 10 ? 1 : 10) + unit * (unit === 10 ? 0 : 1);
  }
}
