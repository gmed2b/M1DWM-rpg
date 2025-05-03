import type { Item } from "./Item";

export class StorageType {
  public items: Item[] = [];

  constructor(public type: string, public capacity: number) {}

  get description(): string {
    return `${this.type} storage with a capacity of ${this.capacity} items.`;
  }
}
