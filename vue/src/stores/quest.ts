import api from '@/services/api'
import { API_URL } from '@/services/api-config'
import { defineStore } from 'pinia'
import { ref } from 'vue'

// Interfaces
export interface Quest {
  id: number
  name: string
  description: string
  difficulty: number
  rewardExp: number
  rewardGold: number
  rewardItems: number[]
  boardSize: number
  encounters: any[]
  createdAt?: Date
  updatedAt?: Date
}

export interface QuestProgress {
  id: number
  questId: number
  currentPosition: number
  isActive: boolean
  isCompleted: boolean
  log: any[]
}

export interface QuestProgressRequest {
  steps?: number
}

export interface QuestStartRequest {
  questId: number
}

export interface QuestProgressResponse {
  id: number
  questId: number
  currentPosition: number
  isActive: boolean
  isCompleted: boolean
  log: any[]
  encounter?: {
    position: number
    type: string
    data: any
    result: any
  }
  questCompleted: boolean
  rewards?: {
    exp: number
    gold: number
    items: number[]
  }
}

export const useQuestStore = defineStore('quest', () => {
  // État
  const quests = ref<Quest[]>([])
  const activeQuests = ref<any[]>([])
  const apiUrl = `${API_URL}/quests`

  // Actions

  // Récupérer toutes les quêtes
  async function getAllQuests() {
    try {
      const response = await api.get<Quest[]>(apiUrl)
      quests.value = response.data
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération des quêtes:', error)
      throw error
    }
  }

  // Récupérer une quête par son ID
  async function getQuestById(questId: number) {
    try {
      const response = await api.get<Quest>(`${apiUrl}/${questId}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de la quête ${questId}:`, error)
      throw error
    }
  }

  // Récupérer les quêtes recommandées pour un héros
  async function getQuestsForHero(heroId: number) {
    try {
      const response = await api.get<Quest[]>(`${apiUrl}/recommended/hero/${heroId}`)
      return response.data
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des quêtes recommandées pour le héros ${heroId}:`,
        error,
      )
      throw error
    }
  }

  // Démarrer une quête
  async function startQuest(heroId: number, request: QuestStartRequest) {
    try {
      const response = await api.post<any>(`${apiUrl}/hero/${heroId}/start`, request)
      return response.data
    } catch (error) {
      console.error('Erreur lors du démarrage de la quête:', error)
      throw error
    }
  }

  // Progresser dans une quête
  async function progressInQuest(heroId: number, questId: number, request: QuestProgressRequest) {
    try {
      const response = await api.post<QuestProgressResponse>(
        `${apiUrl}/hero/${heroId}/quest/${questId}/progress`,
        request,
      )
      return response.data
    } catch (error) {
      console.error('Erreur lors de la progression dans la quête:', error)
      throw error
    }
  }

  // Abandonner une quête
  async function abandonQuest(heroId: number, questId: number) {
    try {
      const response = await api.post<any>(`${apiUrl}/hero/${heroId}/quest/${questId}/abandon`, {})
      return response.data
    } catch (error) {
      console.error("Erreur lors de l'abandon de la quête:", error)
      throw error
    }
  }

  // Récupérer les quêtes actives d'un héros
  async function getActiveQuestsForHero(heroId: number) {
    try {
      const response = await api.get<any[]>(`${apiUrl}/hero/${heroId}/active`)
      activeQuests.value = response.data
      return response.data
    } catch (error) {
      console.error(
        `Erreur lors de la récupération des quêtes actives pour le héros ${heroId}:`,
        error,
      )
      throw error
    }
  }

  // Récupérer la progression d'une quête spécifique
  async function getQuestProgress(heroId: number, questId: number) {
    try {
      const response = await api.get<any>(`${apiUrl}/hero/${heroId}/quest/${questId}/progress`)
      return response.data
    } catch (error) {
      console.error(
        `Erreur lors de la récupération de la progression de la quête ${questId}:`,
        error,
      )
      throw error
    }
  }

  return {
    quests,
    activeQuests,
    getAllQuests,
    getQuestById,
    getQuestsForHero,
    startQuest,
    progressInQuest,
    abandonQuest,
    getActiveQuestsForHero,
    getQuestProgress,
  }
})
