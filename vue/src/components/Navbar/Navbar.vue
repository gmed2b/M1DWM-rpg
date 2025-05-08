<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const isMobileMenuOpen = ref(false)

// Gestion du menu mobile
const toggleMobileMenu = () => {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

// Navigation
const onHome = () => {
  router.push('/dashboard')
}

const onProfile = () => {
  router.push('/profile')
}

// Déconnexion
const logout = () => {
  authStore.logout()
  // La redirection vers /login est gérée dans le store auth
}
</script>

<template>
  <nav class="rpgui-container framed-grey">
    <div class="flex flex-col md:flex-row justify-between items-center">
      <div class="md:hidden w-full text-center mb-2">
        <button class="rpgui-button" type="button" @click="toggleMobileMenu">
          <p>MENU</p>
        </button>
      </div>

      <div
        :class="{ hidden: !isMobileMenuOpen, 'md:flex': true }"
        class="flex flex-col md:flex-row gap-2 md:gap-4 w-full md:w-auto items-center"
      >
        <router-link to="/dashboard" class="rpgui-button" active-class="selected">
          <p>TABLEAU DE BORD</p>
        </router-link>
        <router-link to="/quests" class="rpgui-button" active-class="selected">
          <p>QUÊTES</p>
        </router-link>
        <router-link to="/battles" class="rpgui-button" active-class="selected">
          <p>COMBATS</p>
        </router-link>
        <router-link to="/profile" class="rpgui-button" active-class="selected">
          <p>PROFIL</p>
        </router-link>
      </div>

      <div :class="{ hidden: !isMobileMenuOpen, 'md:block': true }">
        <button class="rpgui-button" type="button" @click="logout">
          <p>DÉCONNEXION</p>
        </button>
      </div>
    </div>
  </nav>
</template>

<style scoped>
.selected {
  background-color: rgba(255, 255, 255, 0.15);
}
</style>
