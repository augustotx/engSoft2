<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"

const props = defineProps<{
  titulo: string
  loginLink: string
  redirectTo: string
  role: 'listener' | 'artist'   // novo: quem está cadastrando
  mostrarDicaUsername?: boolean
}>()

const router = useRouter()
const username = ref('')
const errorMsg = ref('')
const loading = ref(false)

const handleLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response

  if (!username.value.trim()) {
    errorMsg.value = 'Por favor, escolha um nome de usuário antes de continuar.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    // Envia o token do Google + dados do cadastro para o backend
    const res = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        credential,                        // JWT do Google
        username: username.value.trim(),   // nome de usuário escolhido
        role: props.role,                  // 'listener' ou 'artist'
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.value = data.error || 'Erro ao fazer cadastro.'
      return
    }

    // Salva o usuário na sessionStorage para uso na sessão
    sessionStorage.setItem('user', JSON.stringify(data.user))

    router.push(props.redirectTo)

  } catch (err) {
    errorMsg.value = 'Não foi possível conectar ao servidor.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

const handleLoginError = () => {
  errorMsg.value = 'Falha na autenticação com o Google.'
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
          <input
            v-model="username"
            type="text"
            id="username"
            class="form-control form-control-lg"
            placeholder="seu nome de usuário"
          >
          <div class="form-text" v-if="mostrarDicaUsername">Como os fãs encontrarão seu perfil.</div>
        </div>

        <!-- Mensagem de erro -->
        <div v-if="errorMsg" class="alert alert-danger w-100 py-2 text-center small mb-3">
          {{ errorMsg }}
        </div>

        <div class="text-center mb-3">
          <GoogleSignInButton
            @success="handleLoginSuccess"
            @error="handleLoginError"
            :disabled="loading"
          />
        </div>

        <p v-if="loading" class="text-secondary small">Cadastrando...</p>

        <p class="text-center mb-0 mt-3">
          Já tem uma conta?
          <router-link :to="loginLink" class="text-decoration-none">Entrar</router-link>
        </p>

      </div>
    </div>
  </div>
</template>
