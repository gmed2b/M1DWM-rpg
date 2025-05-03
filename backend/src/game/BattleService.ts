// BattleService.ts
import type { Avatar } from "../game/models/Avatar";
import type { Hero } from "../game/models/Hero";

/**
 * This service is responsible for handling the battle logic
 * between two players with detailed battle logging.
 */
export class BattleService {
  private attacker: Avatar;
  private defender: Avatar;
  private battleLog: string[] = [];

  constructor(private player: Hero, private opponent: Avatar) {
    // Initialize battle log
    this.logInitiative();

    // Determine who attacks first based on initiative
    if (this.player.initiative > this.opponent.initiative) {
      this.attacker = player;
      this.defender = opponent;
    }
    else {
      this.attacker = opponent;
      this.defender = player;
    }
  }

  /**
   * Logs initiative rolls and determines first attacker
   */
  private logInitiative(): void {
    this.log(
      `Initiative rolls: ${this.player.name}: ${this.player.initiative.toFixed(
        2,
      )}, ` + `${this.opponent.name}: ${this.opponent.initiative.toFixed(2)}`,
    );
  }

  /**
   * Adds a message to the battle log
   */
  private log(message: string): void {
    this.battleLog.push(message);
  }

  /**
   * Swaps attacker and defender roles
   */
  private swapAttacker(): void {
    const temp = this.attacker;
    this.attacker = this.defender;
    this.defender = temp;
  }

  /**
   * Processes a single attack
   */
  private processAttack(): boolean {
    this.log(`${this.attacker.name} attacks ${this.defender.name}!`);

    const attack = this.attacker.attack;

    if (attack.isCriticalHit) {
      this.log(`CRITICAL HIT! Damage doubled!`);
    }

    const defense = this.defender.defend(attack.damages);

    if (defense.partialDodge) {
      this.log(`${this.defender.name} partially dodges the attack!`);
    }
    else {
      this.log(`${this.defender.name} takes full impact!`);
    }

    this.log(
      `${this.defender.name} takes ${defense.damagesTaken} damage. Health: ${this.defender.health}`,
    );

    // Return true if defender is defeated, false otherwise
    if (this.defender.isDead) {
      this.log(`${this.defender.name} has been defeated!`);
      this.processVictoryRewards();
      return true;
    }

    return false;
  }

  /**
   * Processes victory rewards (XP, gold) when the battle is won
   */
  private processVictoryRewards(): void {
    // Only award experience if player won
    if (this.defender === this.opponent && this.attacker === this.player) {
      const expGained = this.opponent.level * 20;
      const initialLevel = this.player.level;

      this.log(`${this.player.name} gains ${expGained} experience points.`);
      this.player.gainExperience(expGained);

      if (this.player.level > initialLevel) {
        this.log(
          `LEVEL UP! ${this.player.name} reached level ${this.player.level}!`,
        );
      }

      // Award gold
      const goldGained = this.opponent.level * 5;
      this.player.money += goldGained;
      this.log(`${this.player.name} loots ${goldGained} gold coins.`);
    }
  }

  /**
   * Executes the battle sequence and returns the result
   */
  battle(): BattleResult {
    let round = 1;

    do {
      this.log(`--- Round ${round} ---`);

      // Ajout de l'affichage de la vie des joueurs au début du round
      this.log(
        `${this.player.name}: ${this.player.health} HP | ${this.opponent.name}: ${this.opponent.health} HP`,
      );

      // First combatant's turn
      if (this.processAttack()) {
        break; // Combat ends if defender is defeated
      }

      // Switch roles for second combatant's turn
      this.swapAttacker();

      // Second combatant's turn
      if (this.processAttack()) {
        break; // Combat ends if defender is defeated
      }

      // Reset attacker for next round
      this.swapAttacker();

      round++;
    } while (this.player.isAlive && this.opponent.isAlive);

    const winner = this.player.isAlive ? this.player : this.opponent;
    const loser = winner === this.player ? this.opponent : this.player;

    return {
      winner,
      loser,
      rounds: round,
      log: this.battleLog,
    };
  }

  /**
   * Get loot information from the battle
   */
  getLoot(): LootResult {
    return {
      gold: this.opponent.level * 5,
      items: [], // Would contain items in a real implementation
      experience: this.opponent.level * 20,
    };
  }
}

export interface BattleResult {
  winner: Avatar;
  loser: Avatar;
  rounds: number;
  log: string[];
}

export interface LootResult {
  gold: number;
  items: any[];
  experience: number;
}
