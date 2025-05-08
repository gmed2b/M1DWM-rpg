import './assets/main.css'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Création de l'application Vue
const app = createApp(App)

// Utilisation de Pinia pour la gestion d'état
app.use(createPinia())

// Utilisation du Router pour la navigation
app.use(router)

// Montage de l'application sur l'élément #app
app.mount('#app')
