

<template>
  <div class="container mt-4">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">
        <div class="card p-4">
          <h1 class="h4 text-center mb-4">Meu Perfil</h1>

          <div v-if="loading" class="text-center my-5">
            <div class="spinner-border text-primary"></div>
          </div>

          <div v-else-if="error">
            <div class="alert alert-danger">
              {{ error }}
            </div>
            <div class="d-flex justify-content-center">
              <button class="btn btn-sm btn-outline-danger mt-2" @click="fetchProfile">Tentar novamente</button>
            </div>
          </div>

          <div v-else>
            <!-- Status badge (similar) -->
            <div class="mb-4">
              <span class="badge" :class="statusBadgeClass">
                Status: {{ statusText }}
              </span>
            </div>

            <!-- Bloco de assinatura (só para ouvintes) -->
            <div v-if="!isArtist" class="mb-4 p-3 rounded border text-center">
                <p class="mb-1 fw-bold">Plano atual: 
                    <span :class="authStore.isPremium ? 'text-success' : 'text-secondary'">
                        {{ authStore.isPremium ? '⭐ Premium' : 'Gratuito' }}
                    </span>
                </p>
                <button class="btn btn-sm btn-primary mt-2" @click="router.push('/assinatura')">
                    {{ authStore.isPremium ? 'Gerenciar assinatura' : 'Assinar Premium' }}
                </button>
            </div>

            <form @submit.prevent="updateProfile">
              <!-- campos do formulário -->
              <div class="mb-3">
                <label class="form-label">Nome completo</label>
                <input type="text" class="form-control" v-model="form.name" required />
              </div>

              <div class="mb-3">
                <label class="form-label">Nome de usuário</label>
                <input type="text" class="form-control" v-model="form.username" required />
              </div>

              <div class="mb-3">
                <label class="form-label">E-mail</label>
                <input type="email" class="form-control" :value="user.email" disabled />
                <div class="form-text">O e-mail não pode ser alterado.</div>
              </div>

              <div class="mb-3">
                <label class="form-label">Nova senha (opcional)</label>
                <input type="password" class="form-control" v-model="form.password"
                  placeholder="Deixe em branco para manter a atual" />
              </div>

              <div class="mb-3">
                <label class="form-label">URL da foto de perfil</label>
                <input type="text" class="form-control" v-model="form.picture_path"
                  placeholder="https://exemplo.com/minha-foto.jpg" />
                <div v-if="form.picture_path" class="mt-2">
                  <img :src="form.picture_path" alt="Foto de perfil" class="img-thumbnail" style="max-width: 150px;" />
                </div>
              </div>

              <div v-if="isArtist" class="mb-3">
                <label class="form-label">Biografia (artista)</label>
                <textarea class="form-control" v-model="form.bio" rows="3"></textarea>
              </div>

              <div class="d-grid gap-2">
                <button type="submit" class="btn btn-primary" :disabled="updating">
                  {{ updating ? 'Salvando...' : 'Salvar alterações' }}
                </button>
                <button type="button" class="btn btn-outline-secondary" @click="cancelEdit">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  },
  userRole: {
    type: String,
    required: true
    // Não usamos validator restritivo para aceitar 'users'/'artists'
  },
  apiBase: {
    type: String,
    default: 'http://localhost:3000/api'
  }
})

const loading = ref(true)
const updating = ref(false)
const error = ref(null)
const user = ref(null)
const form = ref({
  name: '',
  username: '',
  password: '',
  picture_path: '',
  bio: ''
})

// Normaliza a role: 'user' ou 'users' -> endpoint 'users'; 'artist' ou 'artists' -> endpoint 'artists'
const endpointRole = computed(() => {
  const role = props.userRole
  if (role === 'user' || role === 'users') return 'users'
  if (role === 'artist' || role === 'artists') return 'artists'
  throw new Error(`Role inválida: ${role}`)
})

const isArtist = computed(() => endpointRole.value === 'artists')

const statusText = computed(() => {
  if (!user.value) return ''
  const status = user.value.status
  if (status === 'approved') return 'Aprovado'
  if (status === 'pending') return 'Pendente'
  if (status === 'rejected') return 'Rejeitado'
  return 'Desconhecido'
})

const statusBadgeClass = computed(() => {
  const status = user.value?.status
  if (status === 'approved') return 'bg-success'
  if (status === 'pending') return 'bg-warning text-dark'
  if (status === 'rejected') return 'bg-danger'
  return 'bg-secondary'
})

function getEndpoint() {
  return `${props.apiBase}/${endpointRole.value}/${props.userId}`
}

async function fetchProfile() {
  loading.value = true
  error.value = null
  try {
    const url = getEndpoint()
    console.log('Fetching profile from:', url)
    const res = await fetch(url, {
      credentials: 'include'   // importante para enviar o cookie da sessão
    })
    if (!res.ok) {
      let errMsg = `Erro ${res.status}`
      try {
        const data = await res.json()
        errMsg = data.error || errMsg
      } catch { }
      throw new Error(errMsg)
    }
    const data = await res.json()
    user.value = data
    form.value.name = data.name || ''
    form.value.username = data.username || ''
    form.value.picture_path = data.picture_path || ''
    form.value.bio = data.bio || ''
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

async function updateProfile() {
  updating.value = true
  error.value = null
  try {
    const payload = {
      name: form.value.name,
      username: form.value.username,
      picture_path: form.value.picture_path
    }
    if (form.value.password && form.value.password.trim() !== '') {
      payload.password = form.value.password
    }
    if (isArtist.value) {
      payload.bio = form.value.bio
    }

    const res = await fetch(getEndpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      const errData = await res.json()
      throw new Error(errData.error || 'Erro ao atualizar')
    }

    const updated = await res.json()
    user.value = { ...user.value, ...updated }
    form.value.password = ''
    alert('Perfil atualizado com sucesso!')
  } catch (err) {
    error.value = err.message
  } finally {
    updating.value = false
  }
}

function cancelEdit() {
  if (user.value) {
    form.value.name = user.value.name || ''
    form.value.username = user.value.username || ''
    form.value.picture_path = user.value.picture_path || ''
    form.value.bio = user.value.bio || ''
    form.value.password = ''
  }
}

onMounted(fetchProfile)
</script>
