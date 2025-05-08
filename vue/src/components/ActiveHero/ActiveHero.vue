<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'

const heroStore = useHeroStore()
const router = useRouter()
const loading = ref(true)
const error = ref<string | null>(null)
const showClassSelection = ref(false)

// Liste des classes disponibles
const availableClasses = ['Guerrier', 'Mage', 'Archer', 'Voleur', 'Prêtre']

// Récupération du héros actif depuis le store
const activeHero = computed(() => heroStore.activeHero)

// Initialisation du composant
onMounted(async () => {
  try {
    await heroStore.loadActiveHero()
    loading.value = false
  } catch (err) {
    console.error('Erreur lors du chargement du héros actif:', err)
    error.value = 'Erreur lors du chargement des données du héros actif.'
    loading.value = false
  }
})

// Calcul du pourcentage d'expérience pour la barre de progression
const getXpPercentage = computed(() => {
  if (!activeHero.value) return 0
  const requiredXP = activeHero.value.level * 100
  return Math.min(100, (activeHero.value.experience / requiredXP) * 100)
})

// Obtenir l'icône de classe
const getClassIcon = (characterClass: string | undefined): string => {
  if (!characterClass) return 'sword'

  switch (characterClass.toLowerCase()) {
    case 'mage':
      return 'magic-wand'
    case 'guerrier':
    case 'warrior':
      return 'sword'
    case 'archer':
    case 'ranger':
      return 'bow'
    case 'voleur':
    case 'thief':
    case 'rogue':
      return 'coin-bag'
    case 'prêtre':
    case 'pretre':
    case 'cleric':
    case 'scientist':
    case 'healer':
      return 'potion'
    default:
      return 'sword'
  }
}

// Afficher/masquer le sélecteur de classe
const toggleClassSelection = () => {
  showClassSelection.value = !showClassSelection.value
}

// Changer la classe du héros
const changeHeroClass = async (newClass: string) => {
  if (!activeHero.value) return

  loading.value = true

  try {
    await heroStore.updateHero(activeHero.value.id, { classType: newClass })

    // Mettre à jour le héros actif localement
    heroStore.updateActiveHero({ classType: newClass })

    // Rafraîchir depuis l'API pour s'assurer que tout est à jour
    await heroStore.loadActiveHero()

    showClassSelection.value = false
  } catch (err) {
    console.error('Erreur lors de la mise à jour de la classe:', err)
    error.value = 'Erreur lors de la mise à jour de la classe du héros.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <section class="rpgui-container framed-golden">
    <h2>Personnage Actif</h2>
    <hr class="golden" />

    <div v-if="loading" class="p-4 text-center">
      <p>Chargement du personnage actif...</p>
    </div>

    <div v-if="error" class="rpgui-container framed-grey p-4 text-red-500 text-center">
      {{ error }}
    </div>

    <div v-if="!loading && !activeHero" class="p-4 text-center">
      <p>Vous n'avez pas de personnage actif.</p>
      <router-link to="/create-hero" class="rpgui-button golden mt-4">
        <p>CRÉER UN PERSONNAGE</p>
      </router-link>
    </div>

    <div v-if="!loading && activeHero" class="flex flex-col">
      <!-- En-tête du héros -->
      <div class="flex items-center mb-4">
        <div :class="['rpgui-icon', getClassIcon(activeHero.classType), 'mr-3']"></div>
        <div>
          <h3 class="!text-xl mb-1">{{ activeHero.name }}</h3>
          <div class="flex items-center gap-2">
            <span class="text-sm">Niveau {{ activeHero.level }}</span>
            <span class="text-xs">{{ activeHero.race }} {{ activeHero.classType }}</span>
            <button
              class="rpgui-button golden-small py-1 px-2 text-xs"
              @click="toggleClassSelection"
            >
              <p>Changer de classe</p>
            </button>
          </div>
        </div>
      </div>

      <!-- Sélecteur de classe -->
      <div v-if="showClassSelection" class="rpgui-container framed mb-4 p-3">
        <h4 class="!text-base !mb-2">Choisir une nouvelle classe</h4>
        <div class="grid grid-cols-2 gap-2 mt-2">
          <div v-for="characterClass in availableClasses" :key="characterClass">
            <button
              class="rpgui-button"
              :class="{ golden: activeHero.classType === characterClass }"
              @click="changeHeroClass(characterClass)"
            >
              <div class="flex items-center">
                <div :class="['rpgui-icon', getClassIcon(characterClass), 'mr-2']"></div>
                <p>{{ characterClass }}</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      <!-- Santé et expérience -->
      <div class="mb-4">
        <div class="flex justify-between items-center text-sm mb-1">
          <span>Santé</span>
          <span>{{ activeHero.health }}/100</span>
        </div>
        <div class="rpgui-progress red" data-rpguitype="progress">
          <div class="rpgui-progress-track">
            <div class="rpgui-progress-fill" :style="{ width: activeHero.health + '%' }"></div>
          </div>
        </div>

        <div class="flex justify-between items-center text-sm mt-3 mb-1">
          <span>Expérience</span>
          <span>{{ activeHero.experience }}/{{ activeHero.level * 100 }}</span>
        </div>
        <div class="rpgui-progress" data-rpguitype="progress">
          <div class="rpgui-progress-track">
            <div class="rpgui-progress-fill" :style="{ width: getXpPercentage + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- Attributs -->
      <div class="rpgui-container framed-grey-sm mb-4 p-3">
        <h4 class="!text-base !mb-2">Attributs</h4>
        <div class="grid grid-cols-2 gap-2">
          <div class="flex justify-between">
            <span class="text-sm">Force</span>
            <span class="text-sm">{{ activeHero.stats.strength }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm">Magie</span>
            <span class="text-sm">{{ activeHero.stats.magic }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm">Agilité</span>
            <span class="text-sm">{{ activeHero.stats.agility }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm">Vitesse</span>
            <span class="text-sm">{{ activeHero.stats.speed }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm">Charisme</span>
            <span class="text-sm">{{ activeHero.stats.charisma }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-sm">Chance</span>
            <span class="text-sm">{{ activeHero.stats.luck }}</span>
          </div>
        </div>
      </div>

      <!-- Or -->
      <div class="flex items-center justify-between">
        <div class="flex items-center">
          <div class="rpgui-icon coin-bag mr-2"></div>
          <span class="text-yellow-400">{{ activeHero.money }} pièces d'or</span>
        </div>
        <router-link to="/dashboard" class="rpgui-button">
          <p>JOUER</p>
        </router-link>
      </div>
    </div>
  </section>
</template>
