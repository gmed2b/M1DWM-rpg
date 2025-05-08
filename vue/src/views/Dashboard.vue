<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHeroStore } from '@/stores/hero'
import ActiveHero from '@/components/ActiveHero/ActiveHero.vue'
import QuestPreview from '@/components/QuestPreview/QuestPreview.vue'
import BattlePreview from '@/components/BattlePreview/BattlePreview.vue'

const router = useRouter()
const authStore = useAuthStore()
const heroStore = useHeroStore()

onMounted(async () => {
  // Vérifier si l'utilisateur est authentifié
  if (!authStore.isLoggedIn) {
    router.push('/login')
    return
  }

  // Charger le héros actif au montage du composant
  try {
    await heroStore.loadActiveHero()
  } catch (error) {
    console.error('Erreur lors du chargement du héros actif:', error)
  }
})
</script>

<template>
  <main class="rpgui-container framed">
    <h1 class="!text-2xl">Tableau de bord</h1>
    <hr class="golden mb-8" />

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <!-- SECTION 1: PERSONNAGE ACTIF -->
      <ActiveHero />

      <!-- SECTION 2: QUÊTES DISPONIBLES -->
      <QuestPreview />
    </div>

    <div class="mb-8">
      <!-- SECTION 3: DERNIERS COMBATS -->
      <BattlePreview />
    </div>
  </main>
</template>
