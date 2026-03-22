import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import Bootstrap CSS e JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import nosso tema principal
import '../public/theme.css'

// Import Google-SignIn
import GoogleSignInPlugin from "vue3-google-signin"

const app = createApp(App)
app.use(GoogleSignInPlugin, {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
});
app.use(createPinia())
app.use(router)

app.mount('#app')
