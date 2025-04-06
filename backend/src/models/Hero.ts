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
    public storage: StorageType | null = null
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
    if (!this.storage) {
      return false; // Storage.NO_STORAGE;
    }
    if (this.storage.items.length >= this.storage.capacity) {
      return false; // Storage.FULL;
    }
    this.storage.items.push(item);
    return true; // Storage.ITEM_STORED;
  }

  sellItem(item: Item): boolean {
    if (!this.storage) {
      return false; // Storage.NO_STORAGE;
    }
    const index = this.storage.items.indexOf(item);
    if (index === -1) {
      return false; // Storage.ITEM_NOT_FOUND;
    }
    if (item.durability <= 0) {
      return false; // Storage.ITEM_BROKEN;
    }
    this.storage.items.splice(index, 1);
    const amountDue = item.price - item.price * (item.durability / 100);
    this.money += amountDue;
    return true; // Storage.ITEM_SOLD;
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
