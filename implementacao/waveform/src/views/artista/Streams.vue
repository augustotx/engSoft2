<template>
  <div class="container mt-4" style="max-width: 900px;">
    <h2 class="fw-bold mb-4 text-primary">Painel de Streams</h2>
    
    <!-- Resumo Geral (Cards do topo) -->
    <div class="row mb-4" v-if="resumo">
      <div class="col-md-6">
        <div class="card border-0 shadow-sm p-4 bg-primary text-white h-100">
          <h5 class="opacity-75">Total de Reproduções</h5>
          <h2 class="display-5 fw-bold mb-0">
            <i class="fa-solid fa-play me-2 fs-3"></i>{{ resumo.streams_ultimo_mes }}
          </h2>
        </div>
      </div>
      <div class="col-md-6 mt-3 mt-md-0">
        <div class="card border-0 shadow-sm p-4 bg-success text-white h-100">
          <h5 class="opacity-75">Renda Estimada</h5>
          <h2 class="display-5 fw-bold mb-0">
            <i class="fa-solid fa-money-bill-wave me-2 fs-3"></i>R$ {{ resumo.pagamento_total.toFixed(2).replace('.', ',') }}
          </h2>
        </div>
      </div>
    </div>

    <!-- Lista de Músicas -->
    <div class="card border-0 shadow-sm p-4">
      <h4 class="fw-bold mb-4">Desempenho por Música</h4>
      
      <div v-if="loading" class="text-center my-4">
        <div class="spinner-border text-primary"></div>
      </div>
      
      <div v-else-if="musicas.length === 0" class="text-center text-muted py-5 bg-light rounded">
        <i class="fa-solid fa-music fs-1 mb-3 opacity-50"></i>
        <h5>Você ainda não tem músicas no catálogo.</h5>
        <p>Vá até a aba de Upload para lançar sua primeira faixa!</p>
      </div>

      <div v-else class="list-group">
        <!-- Cabeçalho da Lista (Opcional, para ficar com cara de tabela) -->
        <div class="d-none d-md-flex justify-content-between px-3 pb-2 text-muted small fw-bold border-bottom">
          <div style="flex: 2;">NOME DA MÚSICA</div>
          <div style="flex: 1; text-align: right;">REPRODUÇÕES</div>
          <div style="flex: 1; text-align: right;">RENDA OBTIDA</div>
        </div>

        <!-- Itens da Lista -->
        <div 
          v-for="musica in musicas" 
          :key="musica.id" 
          class="list-group-item d-flex flex-column flex-md-row justify-content-between align-items-md-center p-3 border-0 border-bottom custom-hover"
        >
          <!-- Lado Esquerdo: Ícone e Título -->
          <div class="d-flex align-items-center mb-2 mb-md-0" style="flex: 2;">
            <div class="bg-light rounded p-2 me-3 text-secondary">
              <i class="fa-solid fa-music"></i>
            </div>
            <span class="fw-bold text-dark fs-5">{{ musica.title }}</span>
          </div>

          <!-- Lado Direito: Estatísticas -->
          <div class="d-flex justify-content-between justify-content-md-end gap-md-5 w-100" style="flex: 2;">
            <!-- Streams -->
            <div class="text-md-end">
              <div class="text-muted small d-md-none">Streams</div>
              <span class="fw-bold fs-5 text-secondary">{{ musica.stream_count }}</span>
            </div>
            <!-- Renda -->
            <div class="text-md-end">
              <div class="text-muted small d-md-none">Renda Obtida</div>
              <span class="fw-bold fs-5 text-success">
                R$ {{ (musica.stream_count * 0.005).toFixed(2).replace('.', ',') }}
              </span>
            </div>
          </div>

        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const musicas = ref([])
const resumo = ref(null)
const loading = ref(true)

const carregarDados = async () => {
  const artistId = authStore.user.id

  try {
    // 1. Busca os dados gerais (Total)
    const resResumo = await fetch(`http://localhost:3000/api/artists/${artistId}/pagamento`)
    if (resResumo.ok) {
      resumo.value = await resResumo.json()
    }

    // 2. Busca a lista de músicas detalhada
    const resMusicas = await fetch(`http://localhost:3000/api/artists/${artistId}/songs-streams`)
    if (resMusicas.ok) {
      musicas.value = await resMusicas.json()
    }

  } catch (error) {
    console.error("Erro ao carregar os dados de streams:", error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  carregarDados()
})
</script>

<style scoped>
.custom-hover {
  transition: background-color 0.2s ease;
}
.custom-hover:hover {
  background-color: var(--surface1, #f8f9fa); /* Leve destaque ao passar o mouse */
}
</style>