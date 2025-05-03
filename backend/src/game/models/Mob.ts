import type { Stat } from "./Stat";

import { Avatar } from "./Avatar";

export class Mob extends Avatar {
  constructor(name: string, level: number, stats: Stat) {
    super(name, "Monster", "None", level, stats);
  }
}
