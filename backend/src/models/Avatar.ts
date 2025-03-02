import { Stat } from "./Stat";

export class Avatar {
  public health: number;

  constructor(
    public name: string,
    public race: string,
    public classType: string,
    public level: number,
    public stats: Stat
  ) {
    this.health = stats.baseHealth;
  }

  get initiative(): number {
    return this.stats.speed + Math.random() * 10;
  }

  get attack(): number {
    const isCriticalHit = Math.random() < this.stats.luck / 100;
    const damages = this.stats.attack;
    return isCriticalHit ? damages * 2 : damages;
  }

  defend(damages: number): void {
    const dodgeChance =
      this.stats.agility + this.stats.speed + this.stats.endurance;
    const isDodging = Math.random() < dodgeChance / 100;
    if (isDodging) return;
    this.health = Math.max(0, this.health - damages);
  }
}
