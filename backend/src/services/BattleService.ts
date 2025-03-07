import { Hero } from "../models/Hero";

/**
 * This service is responsible for handling the battle logic
 * between two players.
 *
 * It should be able to determine the winner of the battle
 * based on the player's stats and abilities.
 */
export class BattleService {
  private attacker: Hero;
  private defender: Hero;

  constructor(private player: Hero, private opponent: Hero) {
    if (player.initiative > opponent.initiative) {
      this.attacker = player;
      this.defender = opponent;
    } else {
      this.attacker = opponent;
      this.defender = player;
    }
  }

  private swapAttacker() {
    const temp = this.attacker;
    this.attacker = this.defender;
    this.defender = temp;
  }

  battle(): BattleResult {
    let round = 1;
    const log: string[] = [];

    do {
      log.push(`Round ${round}`);
      log.push(`${this.player.name} has ${this.player.health} health`);
      log.push(`${this.opponent.name} has ${this.opponent.health} health`);

      for (let i = 0; i < 2; i++) {
        log.push(`${this.attacker.name}'s turn`);

        const attack = this.attacker.attack;
        const defense = this.defender.defend(attack.damages);

        if (defense.partialDodge) {
          log.push(`${this.defender.name} partially dodges the attack`);
        }
        log.push(
          `${this.attacker.name} deals ${defense.damagesTaken} damage${
            attack.isCriticalHit ? " (Critical Hit)" : ""
          }`
        );

        if (this.defender.isDead()) {
          log.push(`${this.defender.name} has died`);
          break;
        }

        if (i === 0) {
          this.swapAttacker();
        }
      }

      round++;
    } while (this.player.isAlive() && this.opponent.isAlive());

    return {
      winner: this.attacker,
      loser: this.defender,
      rounds: round,
      log,
    };
  }
}

export interface BattleResult {
  winner: Hero;
  loser: Hero;
  rounds: number;
  log: string[];
}
