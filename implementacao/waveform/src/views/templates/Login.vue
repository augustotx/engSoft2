<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"
import { useNotificationsStore } from '../../stores/notifications'
import { useAuthStore } from '../../stores/auth'  

const is_engsoft = import.meta.env.VITE_IS_ENGSOFT === 'true'

const props = defineProps<{
  titulo: string
  cadastroLink: string
  redirectTo: string
  role: 'artists' | 'users'
}>()

const router = useRouter()
const notificationsStore = useNotificationsStore()
const authStore = useAuthStore()   

const email = ref('')
const password = ref('')
const loading = ref(false)
const manterConectado = ref(false)  

// Login com Google (usa o store)
const handleLoginSuccess = async (response: CredentialResponse) => {
  const { credential } = response
  if (!credential) {
    notificationsStore.enviarNotificacao('Token do Google inválido.', 'erro')
    return
  }

  loading.value = true
  try {
    // O Google Login não precisa de username/role/bio porque o usuário já existe
    // Se for novo, o backend pedirá esses dados. Mas como é tela de LOGIN,
    // assumimos que o usuário já está cadastrado. Se não estiver, o backend
    // retornará erro 400 – você pode tratar redirecionando para cadastro.
    await authStore.googleLogin(credential)
    notificationsStore.enviarNotificacao('Login com Google realizado com sucesso!', 'sucesso')
    router.push(props.redirectTo)
  } catch (err: any) {
    const mensagem = err.message || 'Falha na autenticação com o Google.'
    notificationsStore.enviarNotificacao(mensagem, 'erro')
  } finally {
    loading.value = false
  }
}

const handleLoginError = () => {
  notificationsStore.enviarNotificacao('Falha ao fazer login. Tente novamente.', 'erro')
}

// Login com email/senha (usa o store)
const handleLoginEmail = async () => {
  if (!email.value || !password.value) {
    notificationsStore.enviarNotificacao('Preencha e-mail e senha.', 'erro')
    return
  }

  loading.value = true
  try {
    await authStore.login(email.value, password.value, props.role)
    notificationsStore.enviarNotificacao('Login realizado com sucesso!', 'sucesso')
    router.push(props.redirectTo)
  } catch (err: any) {
    const mensagem = err.message || 'Erro ao realizar o login.'
    notificationsStore.enviarNotificacao(mensagem, 'erro')
  } finally {
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

        <!-- Google Login (modo não-engsoft) -->
        <div v-if="!is_engsoft">
          <GoogleSignInButton @success="handleLoginSuccess" @error="handleLoginError" :disabled="loading" />
        </div>

        <!-- Login tradicional (modo engsoft) -->
        <form v-else class="w-100" @submit.prevent="handleLoginEmail">
          <div class="mb-3">
            <input v-model="email" type="email" class="form-control" placeholder="Email" required :disabled="loading" />
          </div>

          <div class="mb-3">
            <input v-model="password" type="password" class="form-control" placeholder="Senha" required
              :disabled="loading" />
          </div>

          <button class="btn btn-primary w-100" :disabled="loading">
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>

        <!-- Checkbox "Manter conectado" (opcional, requer ajuste no backend) -->
        <div class="form-check mt-3">
          <input class="form-check-input" type="checkbox" id="manterConectado" v-model="manterConectado" />
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