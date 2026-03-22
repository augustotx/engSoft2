<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"

const props = defineProps<{
  titulo: string
  loginLink: string
  redirectTo: string
  mostrarDicaUsername?: boolean
}>()

const router = useRouter()
const username = ref('')

const handleLoginSuccess = (response: CredentialResponse) => {
  const { credential } = response;
  console.log("Access Token", credential);
  console.log("Username:", username.value);
  router.push(props.redirectTo)
}

const handleLoginError = () => {
  console.error("Login failed")
}
</script>

<template>
  <div class="row min-vh-100 g-0 align-items-center justify-content-center">
    <div class="col-sm-12 col-md-8 col-lg-6 px-3">
      <div class="card p-4 p-md-5 d-flex flex-column align-items-center shadow-sm">
        
        <div class="d-flex align-items-center mb-4">
          <img src="/logoPlaceholder.jpg" alt="Logo WaveForm" class="me-2" style="height: 40px; width: auto;">
          <h1 class="h1 mb-0 fw-bold">WaveForm</h1>
        </div>

        <h2 class="h4 text-center mb-4">{{ titulo }}</h2>

        <div class="w-100 mb-4">
          <label for="username" class="form-label text-secondary small fw-bold">NOME DE USUÁRIO</label>
          <input v-model="username" type="text" id="username" class="form-control form-control-lg" placeholder="seu nome de usuário">
            <div class="form-text" v-if="mostrarDicaUsername">Como os fãs encontrarão seu perfil.</div>        </div>

        <div class="text-center mb-3">
          <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError" />
        </div>

        <p class="text-center mb-0 mt-3">
          Já tem uma conta?
          <router-link :to="loginLink" class="text-decoration-none">Entrar</router-link>
        </p>

      </div>
    </div>
  </div>
</template>