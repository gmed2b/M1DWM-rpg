export class Item {
  constructor(
    public name: string,
    public type: string,
    public price: number,
    public durability: number
  ) {}

  get description(): string {
    return `${this.name} :
    - Type: ${this.type}
    - Price: ${this.price} gold coins
    - Durability: ${this.durability}`;
  }

  get rarity(): string {
    if (this.price < 10) return "common";
    if (this.price < 100) return "rare";
    return "legendary";
  }
}
