// test.ts
import { Hero } from "./models/Hero";
import { Item } from "./models/Item";
import { Stat } from "./models/Stat";
import { StorageType } from "./models/StorageType";
import { BattleService } from "./services/BattleService";

console.log("Starting RPG Game Test Scenario");
console.log("-------------------------------\n");

// 1. Create characters with stats
const heroStat = new Stat(4, 8, 3, 5, 6, 6);
const opponentStat = new Stat(7, 1, 5, 3, 2, 3);

// 2. Create hero and opponent
const hero = new Hero("Med", "Human", "Mage", 4, heroStat);
const opponent = new Hero("Grokh", "Orc", "Warrior", 3, opponentStat);

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
