<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Initialisation des variables réactives
const loginForm = reactive({
  username: '',
  password: '',
})

const loginError = ref<string | null>(null)
const usernameError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const router = useRouter()
const authStore = useAuthStore()

// Validation simple du formulaire
const validateForm = () => {
  let isValid = true

  // Validation du nom d'utilisateur
  if (!loginForm.username.trim()) {
    usernameError.value = "Nom d'aventurier requis"
    isValid = false
  } else {
    usernameError.value = null
  }

  // Validation du mot de passe
  if (!loginForm.password.trim()) {
    passwordError.value = 'Mot de passe requis'
    isValid = false
  } else {
    passwordError.value = null
  }

  return isValid
}

// Soumission du formulaire
const onSubmit = async () => {
  if (validateForm()) {
    loginError.value = null

    try {
      await authStore.login({
        username: loginForm.username,
        password: loginForm.password,
      })
      // La redirection est gérée dans le store d'authentification
      console.log('Login successful')
    } catch (error) {
      console.error('Login failed:', error)
      loginError.value = 'Identifiants incorrects. Veuillez réessayer.'
    }
  }
}
</script>

<template>
  <main class="rpgui-container framed flex justify-center items-center py-20!">
    <div class="rpgui-container framed-golden max-w-md w-full p-6">
      <h1 class="!text-2xl text-center">RPG Adventure</h1>
      <hr class="golden mb-8" />

      <!-- Message d'erreur -->
      <div
        v-if="loginError"
        class="mb-4 p-3 rpgui-container framed-grey-sm text-red-500 text-center"
      >
        {{ loginError }}
      </div>

      <!-- Formulaire de connexion -->
      <form @submit.prevent="onSubmit">
        <div class="mb-6">
          <label class="block mb-2">Nom d'aventurier</label>
          <input
            type="text"
            v-model="loginForm.username"
            class="rpgui-input mb-1 w-full"
            placeholder="Entrez votre nom d'aventurier"
          />
          <div v-if="usernameError" class="text-red-400 text-sm">
            {{ usernameError }}
          </div>
        </div>

        <div class="mb-6">
          <label class="block mb-2">Mot de passe</label>
          <input
            type="password"
            v-model="loginForm.password"
            class="rpgui-input mb-1 w-full"
            placeholder="Entrez votre mot de passe"
          />
          <div v-if="passwordError" class="text-red-400 text-sm">
            {{ passwordError }}
          </div>
        </div>

        <div class="flex flex-col gap-3">
          <button
            type="submit"
            class="rpgui-button"
            :disabled="!loginForm.username || !loginForm.password"
          >
            <p>COMMENCER L'AVENTURE</p>
          </button>
        </div>
      </form>

      <hr class="golden my-6" />

      <!-- Pas encore de compte -->
      <div class="text-center">
        <p class="mb-4">Pas encore de compte?</p>
        <router-link to="/register" class="rpgui-button golden">
          <p>CRÉER UN COMPTE</p>
        </router-link>
      </div>
    </div>
  </main>
</template>
