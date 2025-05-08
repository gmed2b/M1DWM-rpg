import api from '@/services/api'
import { API_URL } from '@/services/api-config'
import axios from 'axios'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from './hero'

// Définition de l'interface User
interface User {
  id: number
  username: string
  avatar?: string
  createdAt: string
}

// Définition du store d'authentification
export const useAuthStore = defineStore('auth', () => {
  // État
  const currentUser = ref<User | null>(null)
  const router = useRouter()
  const apiUrl = `${API_URL}/auth`

  // Actions

  // Initialiser l'état de l'authentification au démarrage
  function initialize() {
    const userData = localStorage.getItem('user')
    if (userData) {
      currentUser.value = JSON.parse(userData)
      loadActiveHero()
    }
  }

  // Connexion
  async function login(credentials: { username: string; password: string }) {
    try {
      const response = await axios.post(`${apiUrl}/login`, credentials)
      if (response.data && response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken)
        localStorage.setItem('user', JSON.stringify(response.data.user))
        currentUser.value = response.data.user

        // Charger le héros actif
        await loadActiveHero()

        // Rediriger vers le dashboard
        router.push('/dashboard')
        return response.data
      }
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  // Inscription
  async function register(userData: {
    username: string
    password: string
    confirmPassword: string
  }) {
    try {
      const response = await axios.post(`${apiUrl}/register`, userData)
      return response.data
    } catch (error) {
      console.error("Erreur d'inscription:", error)
      throw error
    }
  }

  // Déconnexion
  function logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    currentUser.value = null
    const heroStore = useHeroStore()
    heroStore.clearActiveHero()
    router.push('/login')
  }

  // Obtenir le profil de l'utilisateur
  async function getProfile() {
    try {
      const response = await api.get(`${apiUrl}/profile`)
      return response.data
    } catch (error) {
      console.error('Erreur lors de la récupération du profil:', error)
      throw error
    }
  }

  // Charger le héros actif
  async function loadActiveHero() {
    const heroStore = useHeroStore()
    await heroStore.loadActiveHero()
  }

  // Getters
  const isLoggedIn = computed(() => !!currentUser.value)
  const token = computed(() => localStorage.getItem('token'))
  const user = computed(() => currentUser.value)

  return {
    currentUser,
    initialize,
    login,
    register,
    logout,
    getProfile,
    loadActiveHero,
    isLoggedIn,
    token,
    user,
  }
})
