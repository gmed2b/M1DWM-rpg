<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'
import { useBattleStore, type BattleRecord } from '@/stores/battle'

const heroStore = useHeroStore()
const battleStore = useBattleStore()
const router = useRouter()

const battles = ref<BattleRecord[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Récupérer l'ID du héros actif depuis le store
const activeHeroId = computed(() => heroStore.activeHero?.id || null)

// Charger les combats au montage du composant
onMounted(async () => {
  try {
    // Charger le héros actif si ce n'est pas déjà fait
    if (!heroStore.activeHero) {
      await heroStore.loadActiveHero()
    }

    // Charger les combats seulement si on a un héros actif
    if (activeHeroId.value) {
      const allBattles = await battleStore.getHeroBattles(activeHeroId.value)
      battles.value = allBattles.slice(0, 3) // Limiter à 3 combats pour l'aperçu
    }

    loading.value = false
  } catch (err) {
    console.error('Erreur lors du chargement des combats:', err)
    error.value = "Impossible de récupérer l'historique des combats."
    loading.value = false
  }
})

// Obtenir le ratio victoires/défaites
const winLossRatio = computed(() => {
  const wins = battles.value.filter((b) => b.winnerId === activeHeroId.value).length
  const losses = battles.value.length - wins
  return { wins, losses }
})

// Calculer le total des dégâts infligés dans tous les combats
const totalDamage = computed(() => {
  return battles.value.reduce((total, battle) => {
    // Additionner les dégâts de chaque entrée du journal de combat
    const damages = battle.battleLog
      ? battle.battleLog.reduce((sum, entry) => sum + (entry.damage || 0), 0)
      : 0
    return total + damages
  }, 0)
})
</script>

<template>
  <section class="rpgui-container framed-golden">
    <h2>Derniers combats</h2>
    <hr />

    <!-- Message d'erreur -->
    <div v-if="error" class="rpgui-container framed-grey mb-2 p-2 text-red-500 text-sm">
      {{ error }}
    </div>

    <!-- Message de chargement -->
    <div v-if="loading" class="p-2 text-sm">
      <p>Chargement des combats...</p>
    </div>

    <!-- Si aucun héros actif -->
    <div v-if="!activeHeroId && !loading" class="p-2 text-sm">
      <p>Sélectionnez un héros actif pour voir vos combats.</p>
    </div>

    <!-- Liste des combats récents -->
    <div v-if="battles.length > 0">
      <div v-for="battle in battles" :key="battle.id" class="rpgui-container framed-grey mb-2 p-2">
        <div class="flex justify-between items-center">
          <span
            class="rpgui-text-shadow"
            :class="battle.winnerId === activeHeroId ? 'text-green-400' : 'text-red-400'"
          >
            {{ battle.winnerId === activeHeroId ? 'VICTOIRE' : 'DÉFAITE' }}
          </span>
          <span
            >vs
            {{
              battle.opponentType === 'mob'
                ? 'Monstre #' + battle.opponentId
                : 'Héros #' + battle.opponentId
            }}
          </span>
        </div>
        <div class="flex justify-between text-sm mt-1">
          <span>Rounds: {{ battle.rounds }}</span>
          <span v-if="battle.winnerId === activeHeroId">
            +{{ battle.rewardExp }} XP, +{{ battle.rewardGold }} Or
          </span>
          <span v-else>+0 XP, +0 Or</span>
        </div>
      </div>
    </div>

    <!-- Message si aucun combat -->
    <div v-if="battles.length === 0 && !loading && activeHeroId" class="p-2 text-sm">
      <p>Vous n'avez pas encore participé à des combats.</p>
    </div>

    <!-- Statistiques et bouton historique -->
    <div v-if="battles.length > 0" class="flex justify-between items-center mt-4">
      <div>
        <div>
          Ratio V/D:
          <span class="rpgui-cursor-point">{{ winLossRatio.wins }}/{{ winLossRatio.losses }}</span>
        </div>
        <div>
          Dégâts totaux:
          <span class="rpgui-cursor-point">{{ totalDamage }}</span>
        </div>
      </div>
      <router-link to="/battles" class="rpgui-button">
        <p>HISTORIQUE</p>
      </router-link>
    </div>

    <!-- Bouton pour accéder à la page des combats s'il n'y a pas de combats récents -->
    <div v-if="battles.length === 0 && !loading && activeHeroId" class="text-center mt-2">
      <router-link to="/battles" class="rpgui-button">
        <p>COMBATTRE</p>
      </router-link>
    </div>
  </section>
</template>
