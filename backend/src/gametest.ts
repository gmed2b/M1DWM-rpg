import { Hero } from "./models/Hero";
import { Item } from "./models/Item";
import { Mob } from "./models/Mob";
import { Stat } from "./models/Stat";
import { StorageType } from "./models/StorageType";

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
const monster = new Mob("Goblin Chief", 4, mobStats);

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
console.log(`Name: ${monster.name}`);
console.log(`Health: ${monster.health}`);
console.log(`Attack: ${monster.stats.attack}`);
console.log(`Defense: ${monster.stats.defense}`);
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

// Combat simulation
console.log("COMBAT SIMULATION:");
console.log(`${hero.name} encounters ${monster.name}!`);
let round = 1;

while (hero.isAlive() && monster.health > 0) {
  console.log(`\n--- Round ${round} ---`);

  // Determine initiative
  const heroInitiative = hero.initiative;
  const monsterInitiative = monster.initiative;

  console.log(
    `Initiative rolls: ${hero.name}: ${heroInitiative.toFixed(2)}, ${
      monster.name
    }: ${monsterInitiative.toFixed(2)}`
  );

  // Hero attacks first if higher initiative
  if (heroInitiative >= monsterInitiative) {
    // Hero's turn
    const heroAttack = hero.attack;
    console.log(`${hero.name} attacks ${monster.name}!`);
    if (heroAttack.isCriticalHit) {
      console.log(`CRITICAL HIT! Damage doubled!`);
    }

    const monsterDefense = monster.defend(heroAttack.damages);
    console.log(
      `${monster.name} ${
        monsterDefense.partialDodge ? "partially dodges" : "takes full impact"
      }!`
    );
    console.log(
      `${monster.name} takes ${monsterDefense.damagesTaken} damage. Health: ${monster.health}`
    );

    // Check if monster is defeated
    if (monster.health <= 0) {
      console.log(`${monster.name} has been defeated!`);
      hero.gainExperience(monster.level * 20);
      console.log(
        `${hero.name} gains ${monster.level * 20} experience points.`
      );
      break;
    }

    // Monster's turn
    const monsterAttack = monster.attack;
    console.log(`${monster.name} attacks ${hero.name}!`);
    if (monsterAttack.isCriticalHit) {
      console.log(`CRITICAL HIT! Damage doubled!`);
    }

    const heroDefense = hero.defend(monsterAttack.damages);
    console.log(
      `${hero.name} ${
        heroDefense.partialDodge ? "partially dodges" : "takes full impact"
      }!`
    );
    console.log(
      `${hero.name} takes ${heroDefense.damagesTaken} damage. Health: ${hero.health}`
    );
  } else {
    // Monster attacks first
    const monsterAttack = monster.attack;
    console.log(`${monster.name} attacks ${hero.name}!`);
    if (monsterAttack.isCriticalHit) {
      console.log(`CRITICAL HIT! Damage doubled!`);
    }

    const heroDefense = hero.defend(monsterAttack.damages);
    console.log(
      `${hero.name} ${
        heroDefense.partialDodge ? "partially dodges" : "takes full impact"
      }!`
    );
    console.log(
      `${hero.name} takes ${heroDefense.damagesTaken} damage. Health: ${hero.health}`
    );

    // Check if hero is defeated
    if (hero.isDead()) {
      console.log(`${hero.name} has been defeated!`);
      break;
    }

    // Hero's turn
    const heroAttack = hero.attack;
    console.log(`${hero.name} attacks ${monster.name}!`);
    if (heroAttack.isCriticalHit) {
      console.log(`CRITICAL HIT! Damage doubled!`);
    }

    const monsterDefense = monster.defend(heroAttack.damages);
    console.log(
      `${monster.name} ${
        monsterDefense.partialDodge ? "partially dodges" : "takes full impact"
      }!`
    );
    console.log(
      `${monster.name} takes ${monsterDefense.damagesTaken} damage. Health: ${monster.health}`
    );
  }

  round++;
}

// Combat results
if (hero.isAlive()) {
  console.log(`\nVICTORY! ${hero.name} has defeated the ${monster.name}!`);
  console.log(`Experience: ${hero.experience}`);
  console.log(`Level: ${hero.level}`);

  // Sell an item
  if (hero.storage && hero.storage.items.length > 0) {
    const itemToSell = hero.storage.items[0];
    console.log(`\nSelling ${itemToSell.name}...`);
    const sold = hero.sellItem(itemToSell);
    console.log(`Item sold successfully: ${sold}`);
    console.log(`${hero.name}'s money: ${hero.money} gold coins`);

    console.log("\nUpdated backpack contents:");
    hero.storage.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name}`);
    });
  }
} else {
  console.log(`\nDEFEAT! ${hero.name} has been slain by the ${monster.name}!`);
  console.log("Game Over!");
}

console.log("\n-------------------------------");
console.log("End of RPG Game Test Scenario");
