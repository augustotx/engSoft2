<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useNotificationsStore } from '../../stores/notifications'

const router = useRouter()
const authStore = useAuthStore()
const notificationsStore = useNotificationsStore()

const loading = ref(false)
const isPremium = ref(false)

onMounted(async () => {
  await authStore.checkSession()

  if (!authStore.user) {
    router.push('/ouvinte/login')
    return
  }

  isPremium.value = authStore.isPremium  // ← pega direto da store
})

async function assinar() {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/subscription/subscribe', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: authStore.user.id })
    })

    const data = await res.json()

    if (!res.ok) {
      notificationsStore.enviarNotificacao(data.error || 'Erro ao assinar', 'erro')
      return
    }

    isPremium.value = true
    notificationsStore.enviarNotificacao('Assinatura ativada com sucesso! 🎵', 'sucesso')
  } catch {
    notificationsStore.enviarNotificacao('Erro de conexão', 'erro')
  } finally {
    loading.value = false
  }
}

async function cancelar() {
  loading.value = true
  try {
    const res = await fetch('http://localhost:3000/api/subscription/cancel', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: authStore.user.id })
    })

    const data = await res.json()

    if (!res.ok) {
      notificationsStore.enviarNotificacao(data.error || 'Erro ao cancelar', 'erro')
      return
    }

    isPremium.value = false
    notificationsStore.enviarNotificacao('Assinatura cancelada.', 'info')
  } catch {
    notificationsStore.enviarNotificacao('Erro de conexão', 'erro')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center mt-5">
    <div class="col-sm-12 col-md-8 col-lg-6">

      <!-- Badge de status atual -->
      <div class="text-center mb-4">
        <span v-if="isPremium" class="badge bg-success fs-6 px-3 py-2">✓ Plano Premium ativo</span>
        <span v-else class="badge bg-secondary fs-6 px-3 py-2">Plano Gratuito</span>
      </div>

      <!-- Card do plano premium -->
      <div class="card shadow-sm border-0">
        <div class="card-header text-center py-3" :class="isPremium ? 'bg-success text-white' : 'bg-primary text-white'">
          <h2 class="mb-0">WaveForm Premium</h2>
        </div>
        <div class="card-body p-4">

          <ul class="list-unstyled mb-4">
            <li class="mb-2">🎵 Downloads de músicas</li>
            <li class="mb-2">🚫 Sem anúncios</li>
            <li class="mb-2">🎧 Qualidade de áudio superior</li>
            <li class="mb-2">📋 Playlists ilimitadas</li>
          </ul>

          <!-- Ativo: mostra botão de cancelar -->
          <div v-if="isPremium">
            <p class="text-muted text-center mb-3">Você já é um assinante Premium!</p>
            <button
              class="btn btn-outline-danger w-100"
              :disabled="loading"
              @click="cancelar"
            >
              {{ loading ? 'Processando...' : 'Cancelar assinatura' }}
            </button>
          </div>

          <!-- Inativo: mostra botão de assinar -->
          <div v-else>
            <p class="text-muted text-center mb-3">Assine agora e aproveite todos os benefícios.</p>
            <button
              class="btn btn-primary w-100"
              :disabled="loading"
              @click="assinar"
            >
              {{ loading ? 'Processando...' : 'Assinar agora' }}
            </button>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>
