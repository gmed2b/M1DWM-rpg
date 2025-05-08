<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'
import { useQuestStore, type Quest } from '@/stores/quest'

const heroStore = useHeroStore()
const questStore = useQuestStore()
const router = useRouter()

const quests = ref<Quest[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Récupérer l'ID du héros actif depuis le store
const activeHeroId = computed(() => heroStore.activeHero?.id || null)

// Charger les quêtes au montage du composant
onMounted(async () => {
  try {
    // Charger le héros actif si ce n'est pas déjà fait
    if (!heroStore.activeHero) {
      await heroStore.loadActiveHero()
    }

    // Charger les quêtes seulement si on a un héros actif
    if (activeHeroId.value) {
      const allQuests = await questStore.getAllQuests()
      quests.value = allQuests.slice(0, 3) // Limiter à 3 quêtes pour l'aperçu
    }

    loading.value = false
  } catch (err) {
    console.error('Erreur lors du chargement des quêtes:', err)
    error.value = 'Impossible de récupérer les quêtes.'
    loading.value = false
  }
})

// Méthodes utilitaires pour afficher la difficulté
const getDifficultyStars = (difficulty: number) => {
  return Array(difficulty).fill(0)
}

const getEmptyStars = (difficulty: number) => {
  return Array(5 - difficulty).fill(0)
}
</script>

<template>
  <section class="rpgui-container framed-golden">
    <h2>Quêtes disponibles</h2>
    <hr />

    <!-- Message d'erreur -->
    <div v-if="error" class="rpgui-container framed-grey mb-2 p-2 text-red-500 text-sm">
      {{ error }}
    </div>

    <!-- Message de chargement -->
    <div v-if="loading" class="p-2 text-sm">
      <p>Chargement des quêtes...</p>
    </div>

    <!-- Si aucun héros actif -->
    <div v-if="!activeHeroId && !loading" class="p-2 text-sm">
      <p>Sélectionnez un héros actif pour voir les quêtes.</p>
    </div>

    <!-- Liste des quêtes -->
    <div v-if="quests.length > 0" class="max-h-80 overflow-y-auto">
      <div v-for="quest in quests" :key="quest.id" class="p-3 mb-2">
        <div class="flex justify-between items-center">
          <h3>{{ quest.name }}</h3>
          <div class="flex">
            <div
              v-for="(star, index) in getDifficultyStars(quest.difficulty)"
              :key="`star-${index}`"
              class="rpgui-icon star"
            ></div>
            <div
              v-for="(emptyStar, index) in getEmptyStars(quest.difficulty)"
              :key="`empty-${index}`"
              class="rpgui-icon empty-slot"
            ></div>
          </div>
        </div>
        <p class="text-sm">
          {{ quest.description }}
        </p>
        <div class="text-sm mt-1">
          Récompense:
          <span class="rpgui-cursor-point"
            >{{ quest.rewardGold }} or, {{ quest.rewardExp }} XP</span
          >
        </div>
      </div>
    </div>

    <!-- Bouton pour voir toutes les quêtes -->
    <div class="text-center mt-2">
      <router-link to="/quests" class="rpgui-button">
        <p>VOIR TOUTES</p>
      </router-link>
    </div>
  </section>
</template>
