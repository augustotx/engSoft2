<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { GoogleSignInButton, type CredentialResponse } from "vue3-google-signin"



const is_engsoft = import.meta.env.VITE_IS_ENGSOFT
console.log(is_engsoft)

const props = defineProps<{
  titulo: string
  loginLink: string
  redirectTo: string
  role: 'listener' | 'artist'   // novo: quem está cadastrando
  mostrarDicaUsername?: boolean
}>()

const router = useRouter()


const username = ref('')
const name = ref()
const email = ref('')
const password = ref('')
const bio = ref('')
const picturePath = ref('')
const errorMsg = ref('')
const loading = ref(false)
const cadastrado = ref(false)

const handleNormalLogin = async () => {
  if (!email.value || !password.value || !username.value) {
    errorMsg.value = 'Preencha todos os campos.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    const res = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: email.value,
        password: password.value,
        username: username.value,
        name: name.value,
        bio: bio.value || null,
        picture_path: picturePath.value || null,
      })
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.value = data.error
      return
    }

    sessionStorage.setItem('user', JSON.stringify(data.user))
    router.push(props.redirectTo)

  } catch {
    errorMsg.value = 'Erro ao conectar'
  } finally {
    loading.value = false
  }
}

const handleLoginGoogle = async (response: CredentialResponse) => {
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
        credential,
        username: username.value.trim(),
        bio: bio.value.trim() || null,
        picture_path: picturePath.value.trim() || null,
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      errorMsg.value = data.error || 'Erro ao fazer cadastro.'
      return
    }

    // Salva o usuário na sessionStorage para uso na sessão
    sessionStorage.setItem('user', JSON.stringify(data.user))

    // Artista vai para tela de aguardo; ouvinte redireciona normalmente
    if (props.role === 'artist') {
      cadastrado.value = true
    } else {
      router.push(props.redirectTo)
    }

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

  <!-- Tela de aguardo (só para artistas após cadastro) -->
  <div v-if="cadastrado" class="row min-vh-100 g-0 align-items-center justify-content-center">
    <div class="col-sm-12 col-md-6 px-3 text-center">
      <div class="card p-5 shadow-sm">
        <h2 class="h4 fw-bold mb-3">Cadastro enviado!</h2>
        <p class="text-secondary">
          Suas informações foram recebidas e serão analisadas por um administrador em breve.
        </p>
        <router-link to="/" class="btn btn-outline-secondary mt-3">Voltar ao início</router-link>
      </div>
    </div>
  </div>

  <!-- Formulário de cadastro -->
  <div v-else class="row min-vh-100 g-0 align-items-center justify-content-center">
    <div class="col-sm-12 col-md-8 col-lg-6 px-3">
      <div class="card p-4 p-md-5 d-flex flex-column align-items-center shadow-sm">
        <div v-if="is_engsoft">

          <div class="d-flex align-items-center mb-4">
            <img src="/logoPlaceholder.jpg" alt="Logo WaveForm" class="me-2" style="height: 40px; width: auto;">
            <h1 class="h1 mb-0 fw-bold">WaveForm</h1>
          </div>

          <h2 class="h4 text-center mb-4">{{ titulo }}</h2>

          <!-- Username -->
          <div class="w-100 mb-4">
            <label for="username" class="form-label text-secondary small fw-bold">NOME DE USUÁRIO</label>
            <input v-model="username" type="text" id="username" class="form-control form-control-lg"
              placeholder="seu nome de usuário">
            <div class="form-text" v-if="mostrarDicaUsername">Como os fãs encontrarão seu perfil.</div>
          </div>

          <!-- Name -->
          <div class="w-100 mb-4">
            <label for="username" class="form-label text-secondary small fw-bold">NOME COMPLETO</label>
            <input v-model="name" type="text" id="name" class="form-control form-control-lg"
              placeholder="seu nome completo">
            <div class="form-text" v-if="mostrarDicaUsername">Seu nome completo.</div>
          </div>
          <!-- Email -->
          <div class="w-100 mb-4">
            <label for="email" class="form-label text-secondary small fw-bold">EMAIL</label>
            <input v-model="email" type="text" id="email" class="form-control form-control-lg"
              placeholder="seu email">
          </div>

          <!-- Senha -->
          <div v-if="is_engsoft" class="w-100 mb-4">
            <label for="username" class="form-label text-secondary small fw-bold">Senha</label>
            <input v-model="password" type="text" id="password" class="form-control form-control-lg">
          </div>

          <!-- Campos extras apenas para artistas -->
          <template v-if="role === 'artist'">
            <div class="w-100 mb-4">
              <label for="bio" class="form-label text-secondary small fw-bold">BIO</label>
              <textarea v-model="bio" id="bio" class="form-control" rows="3"
                placeholder="Fale um pouco sobre você como artista"></textarea>
            </div>

            <div class="w-100 mb-4">
              <label for="picturePath" class="form-label text-secondary small fw-bold">URL DA FOTO DE PERFIL</label>
              <input v-model="picturePath" type="url" id="picturePath" class="form-control" placeholder="https://...">
            </div>
          </template>


          <!-- Erro -->
          <div v-if="errorMsg" class="alert alert-danger w-100 py-2 text-center small mb-3">
            {{ errorMsg }}
          </div>

          <button class="btn btn-primary w-100" @click="handleNormalLogin">
            Entrar
          </button>

          <p v-if="loading" class="text-secondary small">Cadastrando...</p>

          <p class="text-center mb-0 mt-3">
            Já tem uma conta?
            <router-link :to="loginLink" class="text-decoration-none">Entrar</router-link>
          </p>

        </div>
        <div v-if="!is_engsoft">

          <div class="d-flex align-items-center mb-4">
            <img src="/logoPlaceholder.jpg" alt="Logo SpotFei" class="me-2" style="height: 40px; width: auto;">
            <h1 class="h1 mb-0 fw-bold">SpotFei</h1>
          </div>

          <h2 class="h4 text-center mb-4">{{ titulo }}</h2>

          <!-- Username -->
          <div class="w-100 mb-4">
            <label for="username" class="form-label text-secondary small fw-bold">NOME DE USUÁRIO</label>
            <input v-model="username" type="text" id="username" class="form-control form-control-lg"
              placeholder="seu nome de usuário">
            <div class="form-text" v-if="mostrarDicaUsername">Como os fãs encontrarão seu perfil.</div>
          </div>

          <!-- Campos extras apenas para artistas -->
          <template v-if="role === 'artist'">
            <div class="w-100 mb-4">
              <label for="bio" class="form-label text-secondary small fw-bold">BIO</label>
              <textarea v-model="bio" id="bio" class="form-control" rows="3"
                placeholder="Fale um pouco sobre você como artista"></textarea>
            </div>

            <div class="w-100 mb-4">
              <label for="picturePath" class="form-label text-secondary small fw-bold">URL DA FOTO DE PERFIL</label>
              <input v-model="picturePath" type="url" id="picturePath" class="form-control" placeholder="https://...">
            </div>
          </template>

          <!-- Erro -->
          <div v-if="errorMsg" class="alert alert-danger w-100 py-2 text-center small mb-3">
            {{ errorMsg }}
          </div>

          <div class="text-center mb-3">
            <GoogleSignInButton @success="handleLoginGoogle" @error="handleLoginError" :disabled="loading" />
          </div>

          <p v-if="loading" class="text-secondary small">Cadastrando...</p>

          <p class="text-center mb-0 mt-3">
            Já tem uma conta?
            <router-link :to="loginLink" class="text-decoration-none">Entrar</router-link>
          </p>

        </div>
      </div>
    </div>
  </div>
</template>
