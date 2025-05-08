<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useHeroStore } from '@/stores/hero'
import ActiveHero from '@/components/ActiveHero/ActiveHero.vue'

// Types
interface User {
  id: number
  username: string
  avatar?: string
  createdAt: string
}

// Stores et router
const router = useRouter()
const authStore = useAuthStore()
const heroStore = useHeroStore()

// État local
const user = ref<User | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Mappage des classes en anglais vers français
const classTranslations: Record<string, string> = {
  warrior: 'Guerrier',
  mage: 'Mage',
  ranger: 'Archer',
  rogue: 'Voleur',
  cleric: 'Prêtre',
  // Ajouter d'autres traductions si nécessaire
}

// Initialisation
onMounted(async () => {
  await loadUserData()
  await loadCharacters()
})

// Charger les données utilisateur
async function loadUserData() {
  try {
    user.value = authStore.user

    // Si nous avons besoin de données supplémentaires, nous pouvons les récupérer de l'API
    const profileData = await authStore.getProfile()
    if (user.value && profileData) {
      user.value = {
        ...user.value,
        ...profileData,
      }
    }
  } catch (err) {
    console.error('Erreur lors du chargement du profil:', err)
    error.value = 'Erreur lors du chargement des données de profil.'
  }
}

// Charger les personnages
async function loadCharacters() {
  loading.value = true
  try {
    await heroStore.getAllHeroes()

    // Vérifier si un héros actif existe, sinon le charger
    if (!heroStore.activeHero) {
      await heroStore.loadActiveHero()
    }

    loading.value = false
  } catch (err) {
    console.error('Erreur lors du chargement des héros:', err)
    error.value = 'Erreur lors du chargement des personnages.'
    loading.value = false
  }
}

// Méthode pour obtenir le niveau maximum des héros
const getMaxLevel = computed((): number => {
  if (!heroStore.heroes || heroStore.heroes.length === 0) {
    return 0
  }
  return Math.max(...heroStore.heroes.map((c) => c.level))
})

// Méthode pour obtenir l'or total des héros
const getTotalGold = computed((): number => {
  if (!heroStore.heroes || heroStore.heroes.length === 0) {
    return 0
  }
  return heroStore.heroes.reduce((sum, c) => sum + c.money, 0)
})

// Obtenir l'icône de classe
function getClassIcon(characterClass: string): string {
  // Retourne l'icône CSS correspondant à la classe
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

// Traduire le nom de la classe du héros de l'anglais vers le français
function translateHeroClass(classType: string): string {
  const lowercase = classType.toLowerCase()
  return classTranslations[lowercase] || classType
}

// Formater le temps de jeu
function formatPlayTime(minutes?: number): string {
  if (!minutes) return '0h'

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60

  return `${hours}h ${mins}m`
}

// Créer un nouveau personnage
function onCreateCharacter(): void {
  // Navigation vers la page de création de personnage
  router.push('/create-hero')
}

// Sélectionner un personnage comme actif
async function onSelectCharacter(characterId: number): Promise<void> {
  try {
    // Activer le héros
    await heroStore.activateHero(characterId)

    // Recharger les personnages après la sélection
    await loadCharacters()
  } catch (err) {
    console.error('Erreur lors de la sélection du héros:', err)
    error.value = 'Erreur lors de la sélection du personnage.'
  }
}
</script>

<template>
  <main class="rpgui-container framed">
    <h1 class="!text-2xl">Profil d'Aventurier</h1>
    <hr class="golden mb-8" />

    <!-- Message d'erreur -->
    <div v-if="error" class="rpgui-container framed-grey p-4 mb-4 text-red-500 text-center">
      {{ error }}
    </div>

    <!-- Première rangée: Compte et Personnage actif -->
    <div class="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-6 mb-6">
      <!-- SECTION COMPTE (compacte) -->
      <section class="rpgui-container framed-golden">
        <h2>Compte</h2>
        <hr />

        <div v-if="loading" class="p-2 text-center">
          <p>Chargement des informations...</p>
        </div>

        <div v-if="!loading" class="flex flex-col">
          <!-- Informations utilisateur en ligne -->
          <div class="flex items-center mb-3">
            <div class="rpgui-icon empty-slot" style="width: 50px; height: 50px">
              <img
                v-if="user?.avatar"
                :src="user?.avatar || 'assets/avatars/default.png'"
                alt="Avatar"
                style="width: 100%; height: 100%"
              />
            </div>
            <div class="ml-3">
              <h3 class="!text-base mb-0">
                {{ user?.username || 'Aventurier' }}
              </h3>
              <span class="text-xs">
                Membre depuis {{ new Date(user?.createdAt || Date.now()).toLocaleDateString() }}
              </span>
            </div>
          </div>

          <!-- Statistiques en ligne -->
          <div class="rpgui-container framed-grey-sm p-2 mb-3">
            <div class="flex flex-wrap justify-between">
              <div class="flex flex-col items-center px-2">
                <span class="text-xs">Niveau max</span>
                <span class="rpgui-text-shadow text-base">{{ getMaxLevel }}</span>
              </div>
              <div class="flex flex-col items-center px-2">
                <span class="text-xs">Héros</span>
                <span class="rpgui-text-shadow text-base">{{ heroStore.heroes.length }}</span>
              </div>
              <div class="flex flex-col items-center px-2">
                <span class="text-xs">Or total</span>
                <span class="rpgui-text-shadow text-base text-yellow-400">{{ getTotalGold }}</span>
              </div>
              <div class="flex flex-col items-center px-2">
                <span class="text-xs">Temps</span>
                <span class="rpgui-text-shadow text-base">{{ formatPlayTime(792) }}</span>
              </div>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex flex-wrap justify-between gap-2">
            <button class="rpgui-button" type="button" style="font-size: 0.8rem">
              <p>MODIFIER L'AVATAR</p>
            </button>
            <button class="rpgui-button" type="button" style="font-size: 0.8rem">
              <p>MOT DE PASSE</p>
            </button>
          </div>
        </div>
      </section>

      <!-- SECTION PERSONNAGE ACTIF -->
      <ActiveHero />
    </div>

    <!-- Deuxième rangée: Tableau des personnages -->
    <section class="rpgui-container framed-golden">
      <div class="flex justify-between items-center">
        <h2>Mes Personnages</h2>
        <button class="rpgui-button" type="button" @click="onCreateCharacter">
          <p>CRÉER</p>
        </button>
      </div>
      <hr />

      <div v-if="loading" class="p-4 text-center">
        <p>Chargement des personnages...</p>
      </div>

      <div
        v-if="!loading && heroStore.heroes.length > 0"
        class="max-h-[calc(100vh-400px)] overflow-y-auto"
      >
        <table class="rpgui-container framed w-full mb-4">
          <thead>
            <tr class="rpgui-container framed-grey-sm p-2">
              <th class="text-left p-2">Nom</th>
              <th class="text-left p-2 hidden sm:table-cell">Classe</th>
              <th class="text-center p-2">Niveau</th>
              <th class="text-center p-2 hidden md:table-cell">Statut</th>
              <th class="text-right p-2">Actions</th>
            </tr>
          </thead>
          <tbody class="text-white!">
            <tr
              v-for="character in heroStore.heroes"
              :key="character.id"
              class="border-b border-gray-700"
            >
              <td class="p-2">
                {{ character.name }}
              </td>
              <td class="p-2 hidden sm:table-cell">
                <div class="flex items-center">
                  <div :class="['rpgui-icon', getClassIcon(character.classType), 'mr-2']"></div>
                  {{ translateHeroClass(character.classType) }}
                </div>
              </td>
              <td class="p-2 text-center">{{ character.level }}</td>
              <td class="p-2 text-center hidden md:table-cell">
                <span v-if="character.isActive" class="rpgui-text-shadow text-green-400!"
                  >Actif</span
                >
                <span v-else class="text-gray-400!">Inactif</span>
              </td>
              <td class="p-2 text-right">
                <button
                  v-if="!character.isActive"
                  class="rpgui-button golden"
                  type="button"
                  @click="onSelectCharacter(character.id)"
                >
                  <p class="text-xs sm:text-sm">SÉLECTIONNER</p>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="!loading && heroStore.heroes.length === 0">
        <div class="rpgui-container framed-grey p-6 text-center">
          <p class="mb-4">Vous n'avez pas encore de personnage.</p>
          <button class="rpgui-button golden" type="button" @click="onCreateCharacter">
            <p>CRÉER MON PREMIER PERSONNAGE</p>
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
