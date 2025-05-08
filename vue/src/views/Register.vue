<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Initialisation des variables réactives
const registerForm = reactive({
  username: '',
  password: '',
  confirmPassword: '',
})

const registerError = ref<string | null>(null)
const registerSuccess = ref<string | null>(null)
const isLoading = ref(false)
const router = useRouter()
const authStore = useAuthStore()

// Erreurs de validation
const usernameError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const confirmPasswordError = ref<string | null>(null)

// Validation du formulaire
const validateForm = () => {
  let isValid = true

  // Validation du nom d'utilisateur
  if (!registerForm.username.trim()) {
    usernameError.value = "Nom d'aventurier requis"
    isValid = false
  } else if (registerForm.username.length < 3) {
    usernameError.value = 'Le nom doit contenir au moins 3 caractères'
    isValid = false
  } else {
    usernameError.value = null
  }

  // Validation du mot de passe
  if (!registerForm.password.trim()) {
    passwordError.value = 'Mot de passe requis'
    isValid = false
  } else if (registerForm.password.length < 2) {
    passwordError.value = 'Le mot de passe doit contenir au moins 2 caractères'
    isValid = false
  } else {
    passwordError.value = null
  }

  // Validation de la confirmation du mot de passe
  if (!registerForm.confirmPassword.trim()) {
    confirmPasswordError.value = 'Confirmation requise'
    isValid = false
  } else if (registerForm.password !== registerForm.confirmPassword) {
    confirmPasswordError.value = 'Les mots de passe ne correspondent pas'
    isValid = false
  } else {
    confirmPasswordError.value = null
  }

  return isValid
}

// Soumission du formulaire
const onSubmit = async () => {
  if (validateForm()) {
    registerError.value = null
    registerSuccess.value = null
    isLoading.value = true

    try {
      await authStore.register({
        username: registerForm.username,
        password: registerForm.password,
        confirmPassword: registerForm.confirmPassword,
      })

      isLoading.value = false
      registerSuccess.value = 'Inscription réussie ! Vous allez être redirigé...'
      console.log('Registration successful')

      // Réinitialiser le formulaire
      registerForm.username = ''
      registerForm.password = ''
      registerForm.confirmPassword = ''

      // Redirection automatique après 2 secondes
      setTimeout(() => {
        registerSuccess.value = null
        router.push('/login')
      }, 2000)
    } catch (error: any) {
      isLoading.value = false
      console.error('Registration failed:', error)

      // Messages d'erreur plus spécifiques selon le type d'erreur
      if (error.response && error.response.status === 401) {
        registerError.value = "Ce nom d'aventurier est déjà pris. Veuillez en choisir un autre."
      } else {
        registerError.value = "Erreur lors de l'inscription. Veuillez réessayer."
      }
    }
  } else {
    registerError.value = 'Veuillez corriger les erreurs dans le formulaire avant de continuer.'
  }
}
</script>

<template>
  <main class="rpgui-container framed flex justify-center items-center py-20!">
    <div class="rpgui-container framed-golden max-w-md w-full p-6">
      <h1 class="!text-2xl text-center">Création d'Aventurier</h1>
      <hr class="golden mb-8" />

      <!-- Message de succès -->
      <div
        v-if="registerSuccess"
        class="mb-4 p-3 rpgui-container framed-grey-sm text-green-500 text-center"
      >
        {{ registerSuccess }}
      </div>

      <!-- Message d'erreur -->
      <div
        v-if="registerError"
        class="mb-4 p-3 rpgui-container framed-grey-sm text-red-500 text-center"
      >
        {{ registerError }}
      </div>

      <!-- Formulaire d'inscription -->
      <form @submit.prevent="onSubmit">
        <!-- Informations de base -->
        <div class="mb-6">
          <label class="block mb-2">Nom d'aventurier</label>
          <input
            type="text"
            v-model="registerForm.username"
            class="rpgui-input mb-1 w-full"
            placeholder="Choisissez un nom d'aventurier"
          />
          <div v-if="usernameError" class="text-red-400 text-sm">
            {{ usernameError }}
          </div>
        </div>

        <div class="mb-6">
          <label class="block mb-2">Mot de passe</label>
          <input
            type="password"
            v-model="registerForm.password"
            class="rpgui-input mb-1 w-full"
            placeholder="Créez votre mot de passe"
          />
          <div v-if="passwordError" class="text-red-400 text-sm">
            {{ passwordError }}
          </div>
        </div>

        <div class="mb-6">
          <label class="block mb-2">Confirmation du mot de passe</label>
          <input
            type="password"
            v-model="registerForm.confirmPassword"
            class="rpgui-input mb-1 w-full"
            placeholder="Confirmez votre mot de passe"
          />
          <div v-if="confirmPasswordError" class="text-red-400 text-sm">
            {{ confirmPasswordError }}
          </div>
        </div>

        <!-- Boutons d'action -->
        <div class="flex flex-col gap-3">
          <button type="submit" class="rpgui-button golden" :disabled="isLoading">
            <p v-if="!isLoading">CRÉER MON AVENTURIER</p>
            <p v-if="isLoading">CRÉATION EN COURS...</p>
          </button>
        </div>
      </form>

      <!-- Information complémentaire -->
      <div class="text-center mt-6">
        <p class="text-sm mb-4">
          En créant un compte, vous pourrez sauvegarder votre progression, rejoindre des guildes et
          participer aux événements saisonniers.
        </p>
      </div>

      <div class="flex flex-col items-center">
        <hr class="golden mb-2 w-full" />
        <p>Déjà un compte?</p>
        <router-link to="/login" class="rpgui-button">
          <p>CONNEXION</p>
        </router-link>
      </div>
    </div>
  </main>
</template>
