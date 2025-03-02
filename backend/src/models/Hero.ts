import { Avatar } from "./Avatar";
import { Item } from "./Item";
import { Stat } from "./Stat";
import { StorageType } from "./StorageType";

export class Hero extends Avatar {
  public money: number = 0;
  public experience: number = 0;

  constructor(
    name: string,
    race: string,
    classType: string,
    level: number,
    stats: Stat,
    public storage: StorageType
  ) {
    super(name, race, classType, level, stats);
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    if (this.experience >= this.level * 100) {
      this.levelUp();
    }
  }

  storeItem(item: Item): boolean {
    if (this.storage.items.length >= this.storage.capacity) {
      return false; // StoreItem.FULL;
    }
    this.storage.items.push(item);
    return true; // StoreItem.STORED;
  }

  sellItem(item: Item): boolean {
    const index = this.storage.items.indexOf(item);
    if (index === -1) {
      return false; // SellItem.NOT_FOUND;
    }
    if (item.durability <= 0) {
      return false; // SellItem.BROKEN;
    }
    this.storage.items.splice(index, 1);
    const amountDue = item.price - item.price * (item.durability / 100);
    this.money += amountDue;
    return true; // SellItem.SOLD;
  }

  private levelUp(): void {
    this.level++;
    this.experience = 0;
    this.stats.strength += 2;
    this.stats.magic += 2;
    this.stats.agility += 2;
    this.stats.speed += 2;
  }
}
