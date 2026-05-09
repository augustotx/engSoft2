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
            <!-- Subscription / Status -->
            <div class="mb-4">
              <span class="badge" :class="statusBadgeClass">
                Status: {{ statusText }}
              </span>
            </div>

            <!-- Profile Info -->
            <form @submit.prevent="updateProfile">
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
                <input type="password" class="form-control" v-model="form.password" placeholder="Deixe em branco para manter a atual" />
              </div>

              <div class="mb-3">
                <label class="form-label">URL da foto de perfil</label>
                <input type="text" class="form-control" v-model="form.picture_path" placeholder="https://exemplo.com/minha-foto.jpg" />
                <div v-if="form.picture_path" class="mt-2">
                  <img :src="form.picture_path" alt="Foto de perfil" class="img-thumbnail" style="max-width: 150px;" />
                </div>
              </div>

              <div v-if="effectiveRole === 'artist'" class="mb-3">
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

// ========================
// PROPS
// ========================
const props = defineProps({
  userId: {
    type: [Number, String],
    required: true
  },
  userRole: {
    type: String,
    required: true,   // must be 'user' or 'artist'
    validator: (value) => ['user', 'artist'].includes(value)
  },
  apiBase: {
    type: String,
    default: 'http://localhost:3000/api'
  }
})

// ========================
// STATE
// ========================
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

// ========================
// COMPUTED
// ========================
const effectiveRole = computed(() => props.userRole)  // role is fixed by prop

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

// ========================
// METHODS
// ========================
function getEndpoint() {
  return effectiveRole.value === 'artist'
    ? `${props.apiBase}/artists/${props.userId}`
    : `${props.apiBase}/users/${props.userId}`
}

async function fetchProfile() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(getEndpoint())
    if (!res.ok) {
      throw new Error('Erro ao carregar perfil')
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
    // For artists, also include bio
    if (effectiveRole.value === 'artist') {
      payload.bio = form.value.bio
    }

    const res = await fetch(getEndpoint(), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

// ========================
// LIFECYCLE
// ========================
onMounted(fetchProfile)
</script>

<style scoped>
.card {
  background-color: var(--surface1);
  color: var(--text);
}
</style>
