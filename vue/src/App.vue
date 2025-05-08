<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from './stores/auth'
import Navbar from './components/Navbar/Navbar.vue'

const authStore = useAuthStore()
const route = useRoute()

// Vérifier si la page actuelle nécessite la navbar (toutes sauf login et register)
const showNavbar = computed(() => {
  return authStore.isLoggedIn && route.path !== '/login' && route.path !== '/register'
})

// Initialiser le store d'authentification au démarrage
onMounted(() => {
  authStore.initialize()
})
</script>

<template>
  <div class="app-container bg-gray-900 min-h-screen">
    <!-- Navbar visible uniquement si l'utilisateur est connecté -->
    <Navbar v-if="showNavbar" />

    <!-- Le routeur affichera les composants ici -->
    <router-view />
  </div>
</template>

<style>
/* Importer Tailwind CSS */
@import './assets/main.css';

.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
