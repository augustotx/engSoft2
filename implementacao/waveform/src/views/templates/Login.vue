<script setup lang="ts">
import { ref } from 'vue'

import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"
import { useNotificationsStore } from '../../stores/notifications'


const is_engsoft = import.meta.env.VITE_IS_ENGSOFT
console.log(is_engsoft)

const props = defineProps<{
  titulo: string
  cadastroLink: string
  redirectTo: string
}>()

const router = useRouter()
const notificationsStore = useNotificationsStore()
const email = ref('')
const password = ref('')
const loading = ref(false)

const handleLoginSuccess = (response: CredentialResponse) => {
  console.log("Access Token", response.credential)
  router.push(props.redirectTo)
}

const handleLoginError = () => {
  notificationsStore.enviarNotificacao('Falha ao fazer login. Tente novamente.', 'erro')
}

const handleLoginEmail = async () => {
  try {
    loading.value = true

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value
      })
    })

    const data = await response.json()

    if (!response.ok) {
      const mensagem = `Erro ${response.status}: ${data.error || 'Erro no login'}`
      notificationsStore.enviarNotificacao(mensagem, 'erro')
      return
    }

    notificationsStore.enviarNotificacao(
      data.message || 'Login realizado com sucesso',
      'sucesso'
    )

    router.push(props.redirectTo)

  } catch (err) {
    notificationsStore.enviarNotificacao('Erro ao realizar o login.', 'erro')
  } 
  
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row min-vh-100 g-0 align-items-center justify-content-center">
    <div class="col-sm-12 col-md-8 col-lg-6 px-3">
      <div class="card p-4 p-md-5 d-flex flex-column align-items-center shadow-sm">

        <div class="d-flex align-items-center mb-4">
          <img src="/logoPlaceholder.jpg" class="me-2" style="height: 40px; padding-right: 10px;">
          <h1 class="h1 mb-0 fw-bold">WaveForm</h1>
        </div>

        <h2 class="h4 text-center mb-4">{{ titulo }}</h2>

        <div v-if="!is_engsoft">
          <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError" />
        </div>

        <form v-else class="w-100" @submit.prevent="handleLoginEmail" @error="handleLoginError">
          <div class="mb-3">
            <input v-model="email" type="email" class="form-control" placeholder="Email" required />
          </div>

          <div class="mb-3">
            <input v-model="password" type="password" class="form-control" placeholder="Senha" required />
          </div>

          <button class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <div class="form-check mt-3">
          <input class="form-check-input" type="checkbox" id="manterConectado">
          <label class="form-check-label" for="manterConectado">
            Manter-se conectado?
          </label>
        </div>

        <p class="text-center mb-0 mt-3">
          Não tem uma conta?
          <router-link :to="cadastroLink" class="text-decoration-none">
            Cadastre-se
          </router-link>
        </p>

      </div>
    </div>
  </div>
</template>