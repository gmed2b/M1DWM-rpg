import type { Item } from "./Item";
import type { Stat } from "./Stat";
import type { StorageType } from "./StorageType";

import { Avatar } from "./Avatar";

export class Hero extends Avatar {
  public money: number = 0;
  public experience: number = 0;

  constructor(
    name: string,
    race: string,
    classType: string,
    level: number,
    stats: Stat
    // public storage: StorageType | null = null
  ) {
    super(name, race, classType, level, stats);
  }

  gainExperience(amount: number): void {
    this.experience += amount;
    if (this.experience >= this.level * 100) {
      this.levelUp();
    }
  }

  // storeItem(item: Item): boolean {
  //   if (!this.storage) {
  //     return false; // Storage.NO_STORAGE;
  //   }
  //   if (this.storage.items.length >= this.storage.capacity) {
  //     return false; // Storage.FULL;
  //   }
  //   this.storage.items.push(item);
  //   return true; // Storage.ITEM_STORED;
  // }

  // sellItem(item: Item): boolean {
  //   if (!this.storage) {
  //     return false; // Storage.NO_STORAGE;
  //   }
  //   const index = this.storage.items.indexOf(item);
  //   if (index === -1) {
  //     return false; // Storage.ITEM_NOT_FOUND;
  //   }
  //   if (item.durability <= 0) {
  //     return false; // Storage.ITEM_BROKEN;
  //   }
  //   this.storage.items.splice(index, 1);
  //   const amountDue = item.price - item.price * (item.durability / 100);
  //   this.money += amountDue;
  //   return true; // Storage.ITEM_SOLD;
  // }

  /**
   * Sérialise l'instance Hero en objet JSON pour l'enregistrement en base de données
   * @returns Un objet compatible avec le schéma de la base de données
   */
  toJSON() {
    // Convertir les stats en objet simple
    const statsObj = {
      strength: this.stats.strength,
      magic: this.stats.magic,
      agility: this.stats.agility,
      speed: this.stats.speed,
      charisma: this.stats.charisma,
      luck: this.stats.luck,
    };

    // Construction de l'objet final
    return {
      name: this.name,
      race: this.race,
      classType: this.classType,
      experience: this.experience,
      level: this.level,
      stats: JSON.stringify(statsObj),
      health: this.health,
      money: this.money,
      // Si storage est défini, on sérialise les ID des items
      // storage: this.storage
      //   ? {
      //       capacity: this.storage.capacity,
      //       items: this.storage.items.map((item) => item.id),
      //     }
      //   : null,
    };
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
