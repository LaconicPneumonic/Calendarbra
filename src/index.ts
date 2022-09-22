/*
Parser => handles transformation of string to Schedule
Schedule => describes schedule and has methods to return valid ranges over said interval
e.g.
M,W,F every 2 weeks, every 4 weeks

generate all occurences with this as a base and up to a particular limit
*/

import dayjs from "dayjs";
dayjs().format();

const days = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

interface Expression {
  next(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
  ): Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }>;
}
class WeekdayExpression implements Expression {
  /**
   *
   */

  _schedule: Readonly<Record<typeof days[number], boolean>>;
  constructor(schedule: Readonly<Record<typeof days[number], boolean>>) {
    this._schedule = schedule;
  }

  next(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
  ): Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> {
    const schedulePrecision = "days";

    return Array.from({ length: end.diff(start, schedulePrecision) })
      .map((_, i) => start.add(i, schedulePrecision))
      .filter((d) => this._schedule[days[d.day()]])
      .map((d) => ({ start: d.startOf("day"), end: d.endOf("day") }));
  }
}

class WithPeriods implements Expression {
  /**
   *
   */

  _schedule: Readonly<Array<Record<typeof days[number], boolean>>>;
  _repitition: number;
  constructor(
    schedule: Readonly<Array<Record<typeof days[number], boolean>>>,
    repitition: number
  ) {
    this._schedule = schedule;
    this._repitition = repitition;
  }

  next(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
  ): Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> {
    const schedulePrecision = "days";

    const ret: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];
    for (let day = 0; day < end.diff(start, schedulePrecision); day++) {
      const totalWeeks = Math.floor(day / days.length);
      const validRepition =
        Math.floor(totalWeeks / this._schedule.length) % this._repitition === 0;

      if (!validRepition) continue;

      const weekSchedule = this._schedule[totalWeeks % this._schedule.length];

      const dayOfTheWeek = start.add(day, schedulePrecision);

      if (weekSchedule[days[dayOfTheWeek.day()]]) {
        ret.push({
          start: dayOfTheWeek.startOf("day"),
          end: dayOfTheWeek.endOf("day"),
        });
      }
    }

    return ret;
  }
}

class WithPeriodsAndRoot implements Expression {
  /**
   *
   */

  private _schedule: Readonly<Array<Record<typeof days[number], boolean>>>;
  private _repitition: number;
  private _root: dayjs.Dayjs;
  constructor(
    schedule: Readonly<Array<Record<typeof days[number], boolean>>>,
    repitition: number,
    root: dayjs.Dayjs
  ) {
    this._schedule = schedule;
    this._repitition = repitition;
    this._root = root;
  }

  next(
    start: dayjs.Dayjs,
    end: dayjs.Dayjs
  ): Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> {
    const schedulePrecision = "days";

    const startDay =
      this._root.day() + start.diff(this._root, schedulePrecision) - 1;
    const endDay =
      this._root.day() + end.diff(this._root, schedulePrecision) - 1;
    const ret: Array<{ start: dayjs.Dayjs; end: dayjs.Dayjs }> = [];

    console.log(this._root.day(), startDay, endDay);

    for (let day = startDay; day < endDay; day++) {
      const totalWeeks = Math.floor(day / days.length);
      const validRepition =
        Math.floor(totalWeeks / this._schedule.length) % this._repitition === 0;

      if (!validRepition) continue;

      const weekSchedule = this._schedule[totalWeeks % this._schedule.length];

      const dayOfTheWeek = start.add(day, schedulePrecision);

      if (weekSchedule[days[dayOfTheWeek.day()]]) {
        ret.push({
          start: dayOfTheWeek.startOf("day"),
          end: dayOfTheWeek.endOf("day"),
        });
      }
    }

    return ret;
  }
}

class Parser {
  constructor() {}
}

console.log(
  new WithPeriodsAndRoot(
    [
      ...Array.from({ length: 4 }).map((_) => ({
        Sunday: false,
        Monday: true,
        Tuesday: true,
        Wednesday: true,
        Thursday: true,
        Friday: true,
        Saturday: false,
      })),
      {
        Sunday: false,
        Monday: false,
        Tuesday: false,
        Wednesday: false,
        Thursday: false,
        Friday: false,
        Saturday: false,
      },
    ],
    1,
    dayjs("9/05/2022")
  )
    .next(dayjs("9/12/2022"), dayjs("10/24/2022"))
    .map((e) => `${e.start.format()} => ${e.end.format()}`)
);
