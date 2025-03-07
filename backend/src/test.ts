import { Hero } from "./models/Hero";
import { Stat } from "./models/Stat";
import { BattleService } from "./services/BattleService";

const heroStat = new Stat(4, 8, 3, 5, 6, 6);
const hero = new Hero("Med", "Human", "Mage", 4, heroStat);

const opponentStat = new Stat(7, 1, 5, 3, 2, 3);
const opponent = new Hero("Orc", "Orc", "Warrior", 3, opponentStat);

const battleService = new BattleService(hero, opponent);
const results = battleService.battle();
console.log(results);
