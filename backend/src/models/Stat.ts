export class Stat {
  constructor(
    public strength: number,
    public magic: number,
    public agility: number,
    public speed: number,
    public charisma: number,
    public luck: number
  ) {}

  // Statistiques dérivées
  get endurance(): number {
    return this.strength + this.agility;
  }

  get baseHealth(): number {
    return this.endurance * 1.5;
  }

  get attack(): number {
    return this.strength + this.agility + this.magic;
  }

  get defense(): number {
    return this.agility + this.speed + this.endurance;
  }
}
