import api from '@/services/api'
import { API_URL } from '@/services/api-config'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Interfaces
export interface BattleLogEntry {
  round: number
  attacker: string
  defender: string
  damage: number
  attackerHealth: number
  defenderHealth: number
  message: string
  timestamp: Date
}

export interface BattleRecord {
  id: number
  heroId: number
  opponentType: 'hero' | 'mob'
  opponentId: number
  winnerId: number
  rounds: number
  battleLog: BattleLogEntry[]
  rewardExp: number
  rewardGold: number
  rewardItems: number[]
  createdAt: Date
}

export interface BattleResponse {
  battleId: number
  heroId: number
  opponentType: 'hero' | 'mob'
  opponentId: number
  opponentName: string
  heroWon: boolean
  rounds: number
  rewardExp: number
  rewardGold: number
  rewardItems: number[]
  battleLog: BattleLogEntry[]
  heroAfterBattle: {
    health: number
    experience: number
    money: number
    level: number
  }
}

export interface CreateBattleRequest {
  opponentType: 'hero' | 'mob'
  opponentId: number
}

export const useBattleStore = defineStore('battle', () => {
  // État
  const battles = ref<BattleRecord[]>([])
  const apiUrl = `${API_URL}/battles`

  // Actions

  // Récupérer l'historique des combats d'un héros
  async function getHeroBattles(heroId: number) {
    try {
      const response = await api.get<BattleRecord[]>(`${apiUrl}/hero/${heroId}`)
      battles.value = response.data
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération des combats du héros ${heroId}:`, error)
      throw error
    }
  }

  // Récupérer les détails d'un combat spécifique
  async function getBattleById(battleId: number) {
    try {
      const response = await api.get<BattleRecord>(`${apiUrl}/${battleId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération du combat ${battleId}:`, error)
      throw error
    }
  }

  // Créer et lancer un nouveau combat
  async function createBattle(heroId: number, battleData: CreateBattleRequest) {
    try {
      const response = await api.post<BattleResponse>(`${apiUrl}/hero/${heroId}/fight`, battleData)
      // Actualiser la liste des combats après un nouveau combat
      await getHeroBattles(heroId)
      return response.data
    } catch (error) {
      console.error("Erreur lors de la création d'un combat:", error)
      throw error
    }
  }

  // Soigner un héros (repos)
  async function restHero(heroId: number) {
    try {
      const response = await api.post<any>(`${apiUrl}/hero/${heroId}/rest`, {})
      return response.data
    } catch (error) {
      console.error(`Erreur lors du soin du héros ${heroId}:`, error)
      throw error
    }
  }

  return {
    battles,
    getHeroBattles,
    getBattleById,
    createBattle,
    restHero,
  }
})
