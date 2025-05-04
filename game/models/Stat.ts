export class Stat {
  constructor(
    public strength: number,
    public magic: number,
    public agility: number,
    public speed: number,
    public charisma: number,
    public luck: number,
  ) {}

  // Statistiques dérivées
  get endurance(): number {
    return this.strength + this.agility;
  }

  get baseHealth(): number {
    return this.endurance + this.luck;
  }

  get attack(): number {
    return Math.round((this.strength + this.agility + this.magic) / 2);
  }

  get defense(): number {
    return this.agility + this.speed + this.endurance;
  }
}
