<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <button class="btn btn-primary" @click="showForm = true" v-if="!showForm">
        + Nova Playlist
      </button>
    </div>

    <div v-if="showForm" class="card p-4 mb-4 position-relative">
      <button 
        class="btn-close position-absolute top-0 end-0 m-3" 
        @click="showForm = false"
        aria-label="Close"
      ></button>
      
      <h2 class="h5 text-center mb-4">Crie uma nova Playlist</h2>
      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="nome" class="form-label">Nome da Playlist</label>
          <input v-model="nome" type="text" id="nome" class="form-control" required />
        </div>
        <div class="d-grid">
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            Criar Playlist
          </button>
        </div>
      </form>
    </div>

    <div class="mb-4">
      <input type="text" class="form-control" v-model="searchText" placeholder="Buscar playlists..." />
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div 
        v-for="playlist in playlistsFiltradas" 
        :key="playlist.id" 
        class="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center clicavel"
        @click="abrirPlaylist(playlist.id)"
      >
        <div>
          <div class="fw-bold text-primary">
            {{ playlist.name }}
          </div>
          <small class="text-muted">
            {{ playlist.song_count || 0 }} música(s)
          </small>
        </div>
      </div>
      
      <div v-if="playlistsFiltradas.length === 0" class="text-center text-muted mt-4 p-4 rounded bg-secondary">
        Nenhuma playlist encontrada.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from "vue-router"

const router = useRouter()

const playlists = ref([])
const loading = ref(true)
const error = ref(null)
const searchText = ref("")
const showForm = ref(false)
const nome = ref('')
const isSubmitting = ref(false)

const API_BASE = 'http://127.0.0.1:3000/api'
const userId = 1

async function fetchPlaylists() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/playlists`) 
    playlists.value = await res.json()
  } catch (err) {
    error.value = "Erro ao conectar: " + err.message
  } finally {
    loading.value = false
  }
}

async function onSubmit() {
  if (!nome.value) return
  
  isSubmitting.value = true
  
  try {
    const res = await fetch(`${API_BASE}/playlists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: nome.value,
        user_id: userId
      })
    })

    if (res.ok) {
      const novaPlaylist = await res.json()
      novaPlaylist.song_count = 0 
      playlists.value.unshift(novaPlaylist)
      nome.value = ''
      showForm.value = false
    } else {
      alert("Erro ao criar playlist")
    }
  } catch (err) {
    alert("Erro na requisição: " + err.message)
  } finally {
    isSubmitting.value = false
  }
}

function abrirPlaylist(id) {
  router.push(`/playlists/${id}`)
}

const playlistsFiltradas = computed(() => {
  return playlists.value.filter(p =>
    p.name.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

onMounted(fetchPlaylists)
</script>

<style scoped>
.clicavel {
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.clicavel:hover {
  background-color: var(--surface2) !important; 
  transform: translateY(-2px); 
}
</style>