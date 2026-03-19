<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Carregando...</span>
      </div>
    </div>

    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>

    <div v-else-if="album" class="row">
      <!-- Coluna da capa -->
      <div class="col-md-4 mb-4">
        <img
          :src="coverImageUrl"
          :alt="album.title"
          class="img-fluid rounded shadow"
          v-if="coverImageUrl"
        />
        <div v-else class="bg-secondary text-white d-flex align-items-center justify-content-center rounded shadow" style="height: 300px;">
          Sem capa
        </div>
      </div>

      <!-- Coluna das informações -->
      <div class="col-md-8">
        <h1>{{ album.title }}</h1>
        <p class="text-muted" v-if="album.release_date">
          Lançado em: {{ new Date(album.release_date).toLocaleDateString('pt-BR') }}
        </p>

        <h2 class="h5 mt-4">Faixas</h2>
        <ul class="list-group">
          <li
            v-for="song in album.songs"
            :key="song.id"
            class="list-group-item d-flex justify-content-between align-items-center"
          >
            <span>
              <span class="badge bg-secondary me-2">{{ song.track_number }}</span>
              {{ song.title }}
            </span>
            <button class="btn btn-sm btn-outline-primary" @click="playSong(song)">
              ▶
            </button>
          </li>
        </ul>
      </div>
    </div>

    <div v-else class="alert alert-warning">
      Álbum não encontrado.
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { usePlayerStore } from '@/stores/player'

const route = useRoute()
const albumId = route.params.id

const album = ref(null)
const loading = ref(true)
const error = ref(null)

// Backend base URL (ajuste se necessário)
const API_BASE = 'http://localhost:3000/api'
const STATIC_BASE = 'http://localhost:3000'   // Para imagens e arquivos de áudio

const coverImageUrl = computed(() => {
  if (album.value?.cover_image_path) {
    return `${STATIC_BASE}/${album.value.cover_image_path}`
  }
  return null
})

// Player store
const playerStore = usePlayerStore()

function playSong(song) {
  const songUrl = `${STATIC_BASE}/${song.file_path}`
  playerStore.setSongUrl(songUrl)
}

async function fetchAlbum() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${API_BASE}/albums/${albumId}`)
    if (!res.ok) {
      if (res.status === 404) {
        album.value = null
      } else {
        throw new Error(`Erro HTTP: ${res.status}`)
      }
    } else {
      album.value = await res.json()
    }
  } catch (err) {
    error.value = 'Falha ao carregar álbum: ' + err.message
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(fetchAlbum)
</script>
