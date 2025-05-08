import api from '@/services/api'
import { API_URL } from '@/services/api-config'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// Définition des interfaces
export interface HeroStats {
  strength: number
  magic: number
  agility: number
  speed: number
  charisma: number
  luck: number
}

export interface Hero {
  id: number
  name: string
  race: string
  classType: string
  experience: number
  level: number
  stats: HeroStats
  health: number
  money: number
  isActive: boolean
  createdAt: string
}

export interface CreateHeroDto {
  name: string
  race: string
  class_type: string
  stats: HeroStats
}

// Définition du store de héros
export const useHeroStore = defineStore('hero', () => {
  // État
  const activeHero = ref<Hero | null>(null)
  const heroes = ref<Hero[]>([])
  const apiUrl = `${API_URL}/heroes`

  // Actions

  // Charger tous les héros
  async function getAllHeroes() {
    try {
      const response = await api.get<Hero[]>(apiUrl)
      heroes.value = response.data
      return response.data
    } catch (error) {
      console.error('Erreur lors du chargement des héros:', error)
      throw error
    }
  }

  // Charger le héros actif
  async function loadActiveHero() {
    try {
      const allHeroes = await getAllHeroes()
      const hero = allHeroes.find((hero) => hero.isActive)

      if (hero) {
        setActiveHero(hero)
      } else {
        setActiveHero(null)
      }

      return hero || null
    } catch (error) {
      console.error('Erreur lors du chargement du héros actif:', error)
      setActiveHero(null)
      return null
    }
  }

  // Définir le héros actif
  function setActiveHero(hero: Hero | null) {
    activeHero.value = hero
    if (hero) {
      localStorage.setItem('activeHero', JSON.stringify(hero))
    } else {
      localStorage.removeItem('activeHero')
    }
  }

  // Mettre à jour le héros actif
  function updateActiveHero(partialHero: Partial<Hero>) {
    if (activeHero.value) {
      const updatedHero = { ...activeHero.value, ...partialHero }
      setActiveHero(updatedHero)
    }
  }

  // Effacer le héros actif
  function clearActiveHero() {
    setActiveHero(null)
  }

  // Obtenir un héros par ID
  async function getHeroById(id: number) {
    try {
      const response = await api.get<Hero>(`${apiUrl}/${id}`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération du héros ${id}:`, error)
      throw error
    }
  }

  // Créer un héros
  async function createHero(hero: CreateHeroDto) {
    try {
      const response = await api.post<{ message: string; hero: Hero }>(apiUrl, hero)
      await getAllHeroes() // Recharger la liste des héros
      return response.data
    } catch (error) {
      console.error('Erreur lors de la création du héros:', error)
      throw error
    }
  }

  // Mettre à jour un héros
  async function updateHero(id: number, hero: Partial<Hero>) {
    try {
      const response = await api.put<{ message: string; hero: Hero }>(`${apiUrl}/${id}`, hero)
      await getAllHeroes() // Recharger la liste des héros

      // Mettre à jour le héros actif si nécessaire
      if (activeHero.value && activeHero.value.id === id) {
        setActiveHero(response.data.hero)
      }

      return response.data
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du héros ${id}:`, error)
      throw error
    }
  }

  // Supprimer un héros
  async function deleteHero(id: number) {
    try {
      const response = await api.delete<{ message: string }>(`${apiUrl}/${id}`)
      await getAllHeroes() // Recharger la liste des héros

      // Effacer le héros actif si nécessaire
      if (activeHero.value && activeHero.value.id === id) {
        clearActiveHero()
      }

      return response.data
    } catch (error) {
      console.error(`Erreur lors de la suppression du héros ${id}:`, error)
      throw error
    }
  }

  // Activer un héros
  async function activateHero(id: number) {
    try {
      const response = await api.put<{ message: string }>(`${apiUrl}/${id}/activate`, {})
      await loadActiveHero() // Recharger le héros actif
      return response.data
    } catch (error) {
      console.error(`Erreur lors de l'activation du héros ${id}:`, error)
      throw error
    }
  }

  // Obtenir l'inventaire d'un héros
  async function getHeroInventory(id: number) {
    try {
      const response = await api.get<any[]>(`${apiUrl}/${id}/inventory`)
      return response.data
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'inventaire du héros ${id}:`, error)
      throw error
    }
  }

  // Getters
  const hasActiveHero = computed(() => !!activeHero.value)

  return {
    heroes,
    activeHero,
    hasActiveHero,
    getAllHeroes,
    getHeroById,
    loadActiveHero,
    setActiveHero,
    updateActiveHero,
    clearActiveHero,
    createHero,
    updateHero,
    deleteHero,
    activateHero,
    getHeroInventory,
  }
})
