import { useAuthStore } from '@/stores/auth'
import { createRouter, createWebHistory } from 'vue-router'

// Import des composants
import CreateHero from '@/views/CreateHero.vue'
import Dashboard from '@/views/Dashboard.vue'
import Login from '@/views/Login.vue'
import Profile from '@/views/Profile.vue'
import Register from '@/views/Register.vue'

// Création du routeur
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
      meta: { requiresAuth: true },
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true },
    },
    {
      path: '/create-hero',
      name: 'create-hero',
      component: CreateHero,
      meta: { requiresAuth: true },
    },
    // Route par défaut (404)
    {
      path: '/:pathMatch(.*)*',
      redirect: '/dashboard',
    },
  ],
})

// Navigation guard pour vérifier l'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  // Si la route nécessite une authentification
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    // Rediriger vers la page de connexion
    next('/login')
  } else {
    // Cas où l'utilisateur est déjà connecté et essaye d'accéder au login/register
    if ((to.path === '/login' || to.path === '/register') && authStore.isLoggedIn) {
      next('/dashboard')
    } else {
      next()
    }
  }
})

export default router
