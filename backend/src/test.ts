import { Hero } from "./models/Hero";
import { Stat } from "./models/Stat";
import { BattleService } from "./services/BattleService";

const heroStat = new Stat(4, 8, 3, 5, 6, 6);
const hero = new Hero("Med", "Human", "Mage", 4, heroStat);
console.log(hero, {
  endurance: hero.stats.endurance,
  baseHealth: hero.stats.baseHealth,
  attack: hero.stats.attack,
  defense: hero.stats.defense,
});

const opponentStat = new Stat(7, 1, 5, 3, 2, 3);
const opponent = new Hero("Orc", "Orc", "Warrior", 3, opponentStat);
console.log(opponent, {
  endurance: opponent.stats.endurance,
  baseHealth: opponent.stats.baseHealth,
  attack: opponent.stats.attack,
  defense: opponent.stats.defense,
});

const battleService = new BattleService(hero, opponent);
const results = battleService.battle();
console.log(results);
