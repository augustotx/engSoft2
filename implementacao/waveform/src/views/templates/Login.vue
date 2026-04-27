<script setup lang="ts">
import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"
import { useNotificationsStore } from '../../stores/notifications'

const props = defineProps<{
  titulo: string
  cadastroLink: string
  redirectTo: string
}>()

const router = useRouter()
const notificationsStore = useNotificationsStore()

const handleLoginSuccess = (response: CredentialResponse) => {
  console.log("Access Token", response.credential)
  router.push(props.redirectTo)
}

const handleLoginError = () => {
  notificationsStore.enviarNotificacao('Falha ao fazer login. Tente novamente.', 'erro')
}
</script>

<template>
  <div class="row min-vh-100 g-0 align-items-center justify-content-center">
    <div class="col-sm-12 col-md-8 col-lg-6 px-3">
      <div class="card p-4 p-md-5 d-flex flex-column align-items-center shadow-sm">

        <div class="d-flex align-items-center mb-4">
          <img src="/logoPlaceholder.jpg" alt="Logo WaveForm" class="me-2" style="height: 40px; width: auto; padding-right: 10px;">
          <h1 class="h1 mb-0 fw-bold">WaveForm</h1>
        </div>

        <h2 class="h4 text-center mb-4">{{ titulo }}</h2>

          <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError" />

        <div class="form-check mb-3">
          <input class="form-check-input" type="checkbox" id="manterConectado">
          <label class="form-check-label" for="manterConectado">
            Manter-se conectado?
          </label>
        </div>

        <p class="text-center mb-0 mt-3">
          Não tem uma conta?
          <router-link :to="cadastroLink" class="text-decoration-none">Cadastre-se</router-link>
        </p>

      </div>
    </div>
  </div>
</template>