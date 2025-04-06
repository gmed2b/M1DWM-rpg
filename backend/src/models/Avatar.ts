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

  get attack(): {
    damages: number;
    isCriticalHit: boolean;
  } {
    const isCriticalHit = Math.random() < this.stats.luck / 100;
    const damages = this.stats.attack;
    return {
      damages: isCriticalHit ? damages * 2 : damages,
      isCriticalHit,
    };
  }

  defend(damages: number): {
    partialDodge: boolean;
    damagesTaken: number;
  } {
    const dodgeChance =
      this.stats.agility + this.stats.speed + this.stats.endurance;
    const partialDodge = Math.random() < dodgeChance / 100;
    const damagesTaken = partialDodge ? Math.round(damages / 2) : damages;
    this.health = Math.max(0, this.health - damagesTaken);
    return {
      partialDodge,
      damagesTaken,
    };
  }

  get isDead(): boolean {
    return this.health <= 0;
  }

  get isAlive(): boolean {
    return !this.isDead;
  }
}
