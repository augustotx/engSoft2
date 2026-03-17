import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import Bootstrap CSS e JS
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

// Import nosso tema principal
import '../public/theme.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
