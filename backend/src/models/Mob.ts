import { Avatar } from "./Avatar";
import { Stat } from "./Stat";

export class Mob extends Avatar {
  constructor(name: string, level: number, stats: Stat) {
    super(name, "Monster", "None", level, stats);
  }
}
