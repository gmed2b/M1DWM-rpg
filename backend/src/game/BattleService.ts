// BattleService.ts
import { BattleLogEntry } from "../types/battle.types";
import type { Avatar } from "./models/Avatar";
import type { Hero } from "./models/Hero";

/**
 * This service is responsible for handling the battle logic
 * between two players with detailed battle logging.
 */
export class BattleService {
  private attacker: Avatar;
  private defender: Avatar;
  private battleLog: BattleLogEntry[] = [];
  private currentRound: number = 1; // Initialiser à 1 au lieu de 0

  constructor(
    private player: Hero,
    private opponent: Avatar
  ) {
    // Initialize battle log
    this.logInitiative();

    // Determine who attacks first based on initiative
    if (this.player.initiative > this.opponent.initiative) {
      this.attacker = player;
      this.defender = opponent;
    } else {
      this.attacker = opponent;
      this.defender = player;
    }
  }

  /**
   * Logs initiative rolls and determines first attacker
   */
  private logInitiative(): void {
    const message =
      `Initiative rolls: ${this.player.name}: ${this.player.initiative.toFixed(2)}, ` +
      `${this.opponent.name}: ${this.opponent.initiative.toFixed(2)}`;

    this.log("System", "System", 0, this.player.health, this.opponent.health, message);
  }

  /**
   * Adds a structured message to the battle log
   */
  private log(
    attacker: string,
    defender: string,
    damage: number,
    attackerHealth: number,
    defenderHealth: number,
    message: string
  ): void {
    this.battleLog.push({
      round: this.currentRound,
      attacker,
      defender,
      damage,
      attackerHealth,
      defenderHealth,
      message,
      timestamp: new Date(),
    });
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
    // Log the attack
    this.log(
      this.attacker.name,
      this.defender.name,
      0,
      this.attacker.health,
      this.defender.health,
      `${this.attacker.name} attacks ${this.defender.name}!`
    );

    const attack = this.attacker.attack;

    // Log if it's a critical hit
    if (attack.isCriticalHit) {
      this.log(
        this.attacker.name,
        this.defender.name,
        0,
        this.attacker.health,
        this.defender.health,
        "CRITICAL HIT! Damage doubled!"
      );
    }

    const defense = this.defender.defend(attack.damages);

    // Log dodge status
    if (defense.partialDodge) {
      this.log(
        this.attacker.name,
        this.defender.name,
        0,
        this.attacker.health,
        this.defender.health,
        `${this.defender.name} partially dodges the attack!`
      );
    } else {
      this.log(
        this.attacker.name,
        this.defender.name,
        0,
        this.attacker.health,
        this.defender.health,
        `${this.defender.name} takes full impact!`
      );
    }

    // Log damage and remaining health
    this.log(
      this.attacker.name,
      this.defender.name,
      defense.damagesTaken,
      this.attacker.health,
      this.defender.health,
      `${this.defender.name} takes ${defense.damagesTaken} damage. Health: ${this.defender.health}`
    );

    // Return true if defender is defeated, false otherwise
    if (this.defender.isDead) {
      this.log(
        this.attacker.name,
        this.defender.name,
        0,
        this.attacker.health,
        this.defender.health,
        `${this.defender.name} has been defeated!`
      );
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

      this.log(
        "System",
        this.player.name,
        0,
        this.player.health,
        this.defender.health,
        `${this.player.name} gains ${expGained} experience points.`
      );

      this.player.gainExperience(expGained);

      if (this.player.level > initialLevel) {
        this.log(
          "System",
          this.player.name,
          0,
          this.player.health,
          this.defender.health,
          `LEVEL UP! ${this.player.name} reached level ${this.player.level}!`
        );
      }

      // Award gold
      const goldGained = this.opponent.level * 5;
      this.player.money += goldGained;

      this.log(
        "System",
        this.player.name,
        0,
        this.player.health,
        this.defender.health,
        `${this.player.name} loots ${goldGained} gold coins.`
      );
    }
  }

  /**
   * Executes the battle sequence and returns the result
   */
  battle(): BattleResult {
    do {
      // Log round start
      this.log("System", "System", 0, this.player.health, this.opponent.health, `--- Round ${this.currentRound} ---`);

      // Ajout de l'affichage de la vie des joueurs au début du round
      this.log(
        "System",
        "System",
        0,
        this.player.health,
        this.opponent.health,
        `${this.player.name}: ${this.player.health} HP | ${this.opponent.name}: ${this.opponent.health} HP`
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

      // Incrémentez le round à la fin de chaque tour complet
      this.currentRound++;
    } while (this.player.isAlive && this.opponent.isAlive);

    const winner = this.player.isAlive ? this.player : this.opponent;
    const loser = winner === this.player ? this.opponent : this.player;

    return {
      winner,
      loser,
      rounds: this.currentRound, // Utiliser this.currentRound au lieu de round
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
  log: BattleLogEntry[];
}

export interface LootResult {
  gold: number;
  items: any[];
  experience: number;
}
