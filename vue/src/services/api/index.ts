import router from '@/router'
import axios from 'axios'
import { API_URL } from '../api-config'

// Création d'une instance axios personnalisée
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs de réponse (comme les 401)
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Gérer les erreurs 401 Unauthorized
    if (error.response && error.response.status === 401) {
      // Effacer les données d'authentification locales
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('activeHero')

      // Rediriger vers la page de connexion
      if (router.currentRoute.value.path !== '/login') {
        router.push('/login')
      }
    }
    return Promise.reject(error)
  },
)

export default api
