<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHeroStore } from '@/stores/hero'

// Interfaces
interface ClassOption {
  value: string
  label: string
  description: string
  icon: string
}

interface RaceOption {
  value: string
  label: string
  description: string
  icon: string
}

interface StatPreset {
  strength: number
  magic: number
  agility: number
  speed: number
  charisma: number
  luck: number
}

interface HeroForm {
  name: string
  race: string
  class_type: string
  stats: {
    strength: number
    magic: number
    agility: number
    speed: number
    charisma: number
    luck: number
  }
}

type RaceClassKey = `${string}_${string}`

// Configuration
const TOTAL_POINTS = 20
const MAX_STAT_VALUE = 20
const MIN_STAT_VALUE = 1

// Stores et router
const router = useRouter()
const heroStore = useHeroStore()

// État local
const loading = ref(false)
const createError = ref<string | null>(null)
const availablePoints = ref(TOTAL_POINTS)
const formErrors = reactive({
  name: '',
  race: '',
  class_type: '',
  stats: '',
  global: '',
})

// Formulaire réactif
const heroForm = reactive<HeroForm>({
  name: '',
  race: 'human',
  class_type: 'warrior',
  stats: {
    strength: 1,
    magic: 1,
    agility: 1,
    speed: 1,
    charisma: 1,
    luck: 1,
  },
})

// Options de classe
const classOptions: ClassOption[] = [
  {
    value: 'warrior',
    label: 'Guerrier',
    description: 'Spécialiste du combat au corps à corps avec une grande force.',
    icon: 'sword-2',
  },
  {
    value: 'mage',
    label: 'Mage',
    description: 'Manipule les arcanes pour lancer des sorts puissants.',
    icon: 'wand',
  },
  {
    value: 'ranger',
    label: 'Archer',
    description: 'Expert du combat à distance avec une grande agilité.',
    icon: 'bow',
  },
  {
    value: 'rogue',
    label: 'Voleur',
    description: 'Maître de la discrétion et des attaques rapides.',
    icon: 'coin-bag',
  },
  {
    value: 'cleric',
    label: 'Prêtre',
    description: 'Soigneur et protecteur béni par les dieux.',
    icon: 'potion',
  },
]

// Options de race
const raceOptions: RaceOption[] = [
  {
    value: 'human',
    label: 'Humain',
    description: 'Polyvalent et adaptable à toutes les situations.',
    icon: 'wand',
  },
  {
    value: 'elf',
    label: 'Elfe',
    description: "Gracieux et doué pour la magie et l'archerie.",
    icon: 'wand',
  },
  {
    value: 'demon',
    label: 'Démon',
    description: 'Robuste et résistant, expert en combat et artisanat.',
    icon: 'wand',
  },
  {
    value: 'orc',
    label: 'Orc',
    description: 'Fort et endurant, spécialiste du combat brutal.',
    icon: 'wand',
  },
]

// Map des préréglages de stats pour chaque combinaison race/classe
const statPresets: Record<RaceClassKey, StatPreset> = {
  // Humain
  human_warrior: {
    strength: 8,
    magic: 1,
    agility: 4,
    speed: 3,
    charisma: 3,
    luck: 1,
  },
  human_mage: {
    strength: 2,
    magic: 8,
    agility: 2,
    speed: 2,
    charisma: 5,
    luck: 1,
  },
  human_ranger: {
    strength: 3,
    magic: 2,
    agility: 8,
    speed: 4,
    charisma: 2,
    luck: 1,
  },
  human_rogue: {
    strength: 3,
    magic: 1,
    agility: 6,
    speed: 6,
    charisma: 2,
    luck: 2,
  },
  human_cleric: {
    strength: 3,
    magic: 6,
    agility: 1,
    speed: 2,
    charisma: 7,
    luck: 1,
  },

  // Elfe
  elf_warrior: {
    strength: 6,
    magic: 3,
    agility: 5,
    speed: 3,
    charisma: 2,
    luck: 1,
  },
  elf_mage: {
    strength: 1,
    magic: 10,
    agility: 2,
    speed: 3,
    charisma: 3,
    luck: 1,
  },
  elf_ranger: {
    strength: 2,
    magic: 3,
    agility: 9,
    speed: 4,
    charisma: 1,
    luck: 1,
  },
  elf_rogue: {
    strength: 2,
    magic: 2,
    agility: 6,
    speed: 7,
    charisma: 1,
    luck: 2,
  },
  elf_cleric: {
    strength: 2,
    magic: 8,
    agility: 2,
    speed: 2,
    charisma: 5,
    luck: 1,
  },

  // Démon
  demon_warrior: {
    strength: 9,
    magic: 2,
    agility: 3,
    speed: 2,
    charisma: 1,
    luck: 3,
  },
  demon_mage: {
    strength: 3,
    magic: 9,
    agility: 1,
    speed: 2,
    charisma: 2,
    luck: 3,
  },
  demon_ranger: {
    strength: 4,
    magic: 2,
    agility: 7,
    speed: 3,
    charisma: 1,
    luck: 3,
  },
  demon_rogue: {
    strength: 3,
    magic: 1,
    agility: 5,
    speed: 7,
    charisma: 1,
    luck: 3,
  },
  demon_cleric: {
    strength: 3,
    magic: 6,
    agility: 2,
    speed: 2,
    charisma: 4,
    luck: 3,
  },

  // Orc
  orc_warrior: {
    strength: 10,
    magic: 1,
    agility: 2,
    speed: 3,
    charisma: 1,
    luck: 3,
  },
  orc_mage: {
    strength: 5,
    magic: 7,
    agility: 1,
    speed: 2,
    charisma: 2,
    luck: 3,
  },
  orc_ranger: {
    strength: 6,
    magic: 1,
    agility: 6,
    speed: 4,
    charisma: 1,
    luck: 2,
  },
  orc_rogue: {
    strength: 6,
    magic: 1,
    agility: 4,
    speed: 6,
    charisma: 1,
    luck: 2,
  },
  orc_cleric: {
    strength: 5,
    magic: 5,
    agility: 2,
    speed: 2,
    charisma: 4,
    luck: 2,
  },
}

// Class et Race sélectionnées
const selectedClass = computed(
  () => classOptions.find((c) => c.value === heroForm.class_type) || null,
)
const selectedRace = computed(() => raceOptions.find((r) => r.value === heroForm.race) || null)

// Initialisation
onMounted(() => {
  applyStatPreset()
})

// Appliquer le préréglage de stats en fonction de la race et classe
function applyStatPreset(): void {
  const race = heroForm.race
  const classType = heroForm.class_type

  if (race && classType) {
    const presetKey = `${race}_${classType}` as RaceClassKey
    const preset = statPresets[presetKey]

    if (preset) {
      // Appliquer les valeurs du preset aux stats du formulaire
      Object.keys(preset).forEach((stat) => {
        heroForm.stats[stat as keyof StatPreset] = preset[stat as keyof StatPreset]
      })

      // Recalculer les points restants
      calculateRemainingPoints()
    }
  }
}

// Surveiller les changements de race et de classe pour appliquer les presets
watch(
  () => heroForm.race,
  () => {
    applyStatPreset()
  },
)

watch(
  () => heroForm.class_type,
  () => {
    applyStatPreset()
  },
)

// Calcule les points de statistiques restants
function calculateRemainingPoints(): void {
  let usedPoints = 0

  // Calculer le total des points utilisés
  Object.values(heroForm.stats).forEach((value) => {
    usedPoints += value
  })

  // Le total des points disponibles est fixé à 20
  const basePoints = 6 // 6 points de base (1 point par stat)
  availablePoints.value = TOTAL_POINTS - (usedPoints - basePoints)
}

// Observer les changements de stats pour calculer les points restants
watch(() => heroForm.stats, calculateRemainingPoints, { deep: true })

// Incrémente une statistique
function incrementStat(statName: keyof StatPreset): void {
  if (availablePoints.value > 0 && heroForm.stats[statName] < MAX_STAT_VALUE) {
    heroForm.stats[statName]++
  }
}

// Décrémente une statistique
function decrementStat(statName: keyof StatPreset): void {
  if (heroForm.stats[statName] > MIN_STAT_VALUE) {
    heroForm.stats[statName]--
  }
}

// Valider le formulaire
function validateForm(): boolean {
  let isValid = true

  // Réinitialiser les erreurs
  formErrors.name = ''
  formErrors.race = ''
  formErrors.class_type = ''
  formErrors.stats = ''
  formErrors.global = ''

  // Valider le nom
  if (!heroForm.name.trim()) {
    formErrors.name = 'Le nom est requis'
    isValid = false
  } else if (heroForm.name.length < 3) {
    formErrors.name = 'Le nom doit contenir au moins 3 caractères'
    isValid = false
  } else if (heroForm.name.length > 20) {
    formErrors.name = 'Le nom ne peut pas dépasser 20 caractères'
    isValid = false
  }

  // Valider la race
  if (!heroForm.race) {
    formErrors.race = 'Choisissez une race'
    isValid = false
  }

  // Valider la classe
  if (!heroForm.class_type) {
    formErrors.class_type = 'Choisissez une classe'
    isValid = false
  }

  // Valider les points de stats
  if (availablePoints.value < 0) {
    formErrors.stats = 'Vous avez utilisé trop de points!'
    isValid = false
  }

  return isValid
}

// Soumission du formulaire
async function onSubmit(): Promise<void> {
  if (!validateForm()) {
    formErrors.global = 'Veuillez corriger les erreurs dans le formulaire.'
    return
  }

  loading.value = true
  createError.value = null

  try {
    await heroStore.createHero({
      name: heroForm.name,
      race: heroForm.race,
      class_type: heroForm.class_type,
      stats: heroForm.stats,
    })

    loading.value = false
    router.push('/profile')
  } catch (error) {
    console.error('Erreur lors de la création du héros:', error)
    createError.value = 'Erreur lors de la création du héros. Veuillez réessayer.'
    loading.value = false
  }
}

// Annuler et retourner au profil
function onCancel(): void {
  router.push('/profile')
}
</script>

<template>
  <main class="rpgui-container framed">
    <h1 class="!text-2xl">Création de Personnage</h1>
    <hr class="golden mb-8" />

    <!-- Message d'erreur -->
    <div v-if="createError" class="rpgui-container framed-grey p-4 mb-4 text-red-500 text-center">
      {{ createError }}
    </div>

    <form @submit.prevent="onSubmit" class="space-y-6">
      <!-- Layout principal en colonnes (Identité et Statistiques) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Informations de base (1fr) -->
        <div class="rpgui-container framed-golden p-4 md:col-span-1">
          <h2>Identité</h2>
          <hr class="golden mb-3" />

          <div class="mb-6">
            <label class="block mb-2">Nom du personnage</label>
            <input
              type="text"
              v-model="heroForm.name"
              class="rpgui-input mb-1 w-full"
              placeholder="Entrez le nom de votre personnage"
            />
            <div v-if="formErrors.name" class="text-red-400 text-sm">
              {{ formErrors.name }}
            </div>
          </div>

          <!-- Races et Classes en colonnes -->
          <div class="grid grid-cols-2 gap-3">
            <!-- Race -->
            <div class="mb-4">
              <label class="block mb-2 !text-xs font-bold">Race</label>
              <div class="flex flex-col gap-2 h-[600px] overflow-y-auto">
                <div
                  v-for="raceOption in raceOptions"
                  :key="raceOption.value"
                  class="rpgui-container p-2 cursor-pointer"
                  :class="{ 'framed-golden': heroForm.race === raceOption.value }"
                  @click="heroForm.race = raceOption.value"
                >
                  <label>
                    <input
                      type="radio"
                      :value="raceOption.value"
                      v-model="heroForm.race"
                      class="opacity-0 absolute"
                    />
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'rpgui-icon',
                          raceOption.icon,
                          'w-8',
                          'h-8',
                          'mb-1',
                          'flex-shrink-0',
                        ]"
                      ></div>
                      <div class="text-center">
                        <h3 class="!text-xs mb-1 font-bold">
                          {{ raceOption.label }}
                        </h3>
                        <p class="!text-[10px]">{{ raceOption.description }}</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div v-if="formErrors.race" class="text-red-400 !text-[10px] mt-1">
                {{ formErrors.race }}
              </div>
            </div>

            <!-- Classe -->
            <div class="mb-4">
              <label class="block mb-2 !text-xs font-bold">Classe</label>
              <div class="flex flex-col gap-2 h-[600px] overflow-y-auto">
                <div
                  v-for="classOption in classOptions"
                  :key="classOption.value"
                  class="rpgui-container p-2 cursor-pointer"
                  :class="{ 'framed-golden': heroForm.class_type === classOption.value }"
                  @click="heroForm.class_type = classOption.value"
                >
                  <label>
                    <input
                      type="radio"
                      :value="classOption.value"
                      v-model="heroForm.class_type"
                      class="opacity-0 absolute"
                    />
                    <div class="flex flex-col items-center">
                      <div
                        :class="[
                          'rpgui-icon',
                          classOption.icon,
                          'w-8',
                          'h-8',
                          'mb-1',
                          'flex-shrink-0',
                        ]"
                      ></div>
                      <div class="text-center">
                        <h3 class="!text-xs mb-1 font-bold">
                          {{ classOption.label }}
                        </h3>
                        <p class="!text-[10px]">{{ classOption.description }}</p>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
              <div v-if="formErrors.class_type" class="text-red-400 !text-[10px] mt-1">
                {{ formErrors.class_type }}
              </div>
            </div>
          </div>
        </div>

        <!-- Statistiques (2fr) -->
        <div class="rpgui-container framed-golden p-4 md:col-span-2">
          <div class="flex justify-between items-center mb-2">
            <h2>Statistiques</h2>
            <div>
              Points restants:
              <span
                :class="availablePoints < 0 ? 'text-red-500' : 'text-yellow-400'"
                class="rpgui-text-shadow"
              >
                {{ availablePoints }}
              </span>
            </div>
          </div>
          <hr class="golden" />

          <div class="space-y-4 mt-4">
            <!-- Force -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Force</span>
                  <p class="text-xs mt-1">
                    Affecte les dégâts physiques et la capacité à porter des objets lourds
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('strength')"
                    :disabled="heroForm.stats.strength <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.strength
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('strength')"
                    :disabled="availablePoints <= 0 || heroForm.stats.strength >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Magie -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Magie</span>
                  <p class="text-xs mt-1">
                    Détermine la puissance des sorts et la résistance magique
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('magic')"
                    :disabled="heroForm.stats.magic <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.magic
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('magic')"
                    :disabled="availablePoints <= 0 || heroForm.stats.magic >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Agilité -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Agilité</span>
                  <p class="text-xs mt-1">Améliore la précision des attaques et l'esquive</p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('agility')"
                    :disabled="heroForm.stats.agility <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.agility
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('agility')"
                    :disabled="availablePoints <= 0 || heroForm.stats.agility >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Vitesse -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Vitesse</span>
                  <p class="text-xs mt-1">
                    Détermine l'ordre d'attaque et la capacité à se déplacer
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('speed')"
                    :disabled="heroForm.stats.speed <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.speed
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('speed')"
                    :disabled="availablePoints <= 0 || heroForm.stats.speed >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Charisme -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Charisme</span>
                  <p class="text-xs mt-1">
                    Influence les prix des marchands et les interactions sociales
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('charisma')"
                    :disabled="heroForm.stats.charisma <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.charisma
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('charisma')"
                    :disabled="availablePoints <= 0 || heroForm.stats.charisma >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <!-- Chance -->
            <div class="rpgui-container framed-grey-sm p-3">
              <div class="flex justify-between items-center">
                <div>
                  <span class="text-white font-semibold">Chance</span>
                  <p class="text-xs mt-1">
                    Augmente les chances de coups critiques et de trouver des objets rares
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="decrementStat('luck')"
                    :disabled="heroForm.stats.luck <= 1"
                  >
                    -
                  </button>
                  <span class="rpgui-text-shadow text-yellow-400 w-6 text-center">{{
                    heroForm.stats.luck
                  }}</span>
                  <button
                    type="button"
                    class="rpgui-button px-2 py-1"
                    @click="incrementStat('luck')"
                    :disabled="availablePoints <= 0 || heroForm.stats.luck >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Message d'erreur si trop de points utilisés -->
          <div v-if="formErrors.stats" class="text-red-500 mt-4 text-center">
            {{ formErrors.stats }}
          </div>
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex gap-4 justify-center mt-6">
        <button type="button" class="rpgui-button" @click="onCancel">
          <p>ANNULER</p>
        </button>
        <button
          type="submit"
          class="rpgui-button golden"
          :disabled="availablePoints < 0 || loading"
        >
          <p>{{ loading ? 'CRÉATION...' : 'CRÉER' }}</p>
        </button>
      </div>
    </form>
  </main>
</template>
