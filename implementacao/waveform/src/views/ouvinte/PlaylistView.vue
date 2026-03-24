<template>
  <div class="container mt-4">
    <button class="btn btn-outline-primary mb-4" @click="router.back()">
      &larr; Voltar
    </button>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="playlist">
      <div class="mb-4">
        <h1 class="display-5 text-primary">{{ playlist.name }}</h1>
        <p class="text-muted">
          Criada em: {{ new Date(playlist.created_at).toLocaleDateString() }}
        </p>
      </div>

      <h3 class="mb-3">Músicas</h3>
      
      <div v-if="playlist.songs && playlist.songs.length > 0">
        <div 
          v-for="(song, index) in playlist.songs" 
          :key="song.id"
          class="card p-3 mb-2 flex-row justify-content-between align-items-center"
        >
          <div>
            <span class="text-muted me-3">{{ index + 1 }}</span>
            <span class="fw-bold">{{ song.title }}</span>
          </div>
          <button class="btn btn-sm btn-primary">Tocar</button>
        </div>
      </div>
      
      <div v-else class="text-center text-muted mt-4 p-5 rounded bg-secondary">
        Nenhuma música nesta playlist ainda.
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const playlist = ref(null)
const loading = ref(true)
const error = ref(null)

const API_BASE = 'http://127.0.0.1:3000/api'

async function fetchPlaylistDetails() {
  loading.value = true
  error.value = null
  try {
    const id = route.params.id
    const res = await fetch(`${API_BASE}/playlists/${id}`)
    
    if (!res.ok) {
      throw new Error('Falha ao carregar a playlist.')
    }
    
    playlist.value = await res.json()
  } catch (err) {
    error.value = "Erro: " + err.message
  } finally {
    loading.value = false
  }
}

onMounted(fetchPlaylistDetails)
</script>