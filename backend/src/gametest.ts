import { Hero } from "./models/Hero";
import { Item } from "./models/Item";
import { Mob } from "./models/Mob";
import { Stat } from "./models/Stat";
import { StorageType } from "./models/StorageType";
import { BattleService } from "./services/BattleService";

// GameTest.ts
console.log("Starting RPG Game Test Scenario");
console.log("-------------------------------\n");

// 1. Create hero and monster stats
const heroStats = new Stat(10, 8, 10, 9, 12, 8);
const mobStats = new Stat(12, 5, 8, 7, 4, 6);

// 2. Create storage for hero
const heroBackpack = new StorageType("Backpack", 10);

// 3. Create a hero
const hero = new Hero(
  "Aragorn",
  "Human",
  "Warrior",
  5,
  heroStats,
  heroBackpack
);

// 4. Create a monster
const opponent = new Mob("Goblin Chief", 4, mobStats);

// 5. Create some items
const sword = new Item("Steel Sword", "Weapon", 85, 100);
const shield = new Item("Wooden Shield", "Armor", 35, 80);
const potion = new Item("Health Potion", "Consumable", 7, 100);
const gem = new Item("Ruby", "Treasure", 120, 100);

// Display characters information
console.log("HERO:");
console.log(`Name: ${hero.name}`);
console.log(`Race: ${hero.race}`);
console.log(`Class: ${hero.classType}`);
console.log(`Level: ${hero.level}`);
console.log(`Health: ${hero.health}`);
console.log(`Attack: ${hero.stats.attack}`);
console.log(`Defense: ${hero.stats.defense}`);
console.log(`Storage: ${hero.storage?.description}`);
console.log("\n");

console.log("MONSTER:");
console.log(`Name: ${opponent.name}`);
console.log(`Health: ${opponent.health}`);
console.log(`Attack: ${opponent.stats.attack}`);
console.log(`Defense: ${opponent.stats.defense}`);
console.log("\n");

// Store items in backpack
console.log("ITEM STORAGE TEST:");
console.log(`Storing ${sword.name}...`);
const swordStored = hero.storeItem(sword);
console.log(`Item stored successfully: ${swordStored}`);

console.log(`Storing ${shield.name}...`);
const shieldStored = hero.storeItem(shield);
console.log(`Item stored successfully: ${shieldStored}`);

console.log(`Storing ${potion.name}...`);
const potionStored = hero.storeItem(potion);
console.log(`Item stored successfully: ${potionStored}`);

console.log(`Storing ${gem.name}...`);
const gemStored = hero.storeItem(gem);
console.log(`Item stored successfully: ${gemStored}`);

console.log("\nBackpack contents:");
if (hero.storage) {
  hero.storage.items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.description}`);
    console.log(`   Rarity: ${item.rarity}`);
  });
}
console.log("\n");

// Track initial hero stats
const initialHealth = hero.health;
const initialLevel = hero.level;
const initialExperience = hero.experience;
const initialMoney = hero.money;

console.log(`BATTLE BEGINS: ${hero.name} vs ${opponent.name}!`);
console.log("-------------------------------");

// Battle simulation using the refactored BattleService
const battleService = new BattleService(hero, opponent);
const result = battleService.battle();

// Display battle logs
result.log.forEach((entry) => console.log(entry));

console.log("-------------------------------");
console.log(`BATTLE OVER: ${result.winner.name} WINS!`);
console.log("-------------------------------");

// Hero status summary after battle
console.log("\nHERO STATUS AFTER BATTLE:");
console.log(`Health: ${initialHealth} → ${hero.health}`);
console.log(`Level: ${initialLevel} → ${hero.level}`);
console.log(`Experience: ${initialExperience} → ${hero.experience}`);
console.log(`Money: ${initialMoney} → ${hero.money}`);

console.log("\n-------------------------------");
console.log("End of RPG Game Test Scenario");
