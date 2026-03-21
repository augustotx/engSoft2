<script setup>
import { ref, onMounted, computed } from "vue"
import { usePlayerStore } from '@/stores/player'

const songs = ref([])
const loading = ref(true)
const error = ref(null)
const searchText = ref("")

const API_BASE = 'http://127.0.0.1:3000/api'
const STATIC_BASE = 'http://127.0.0.1:3000'

const playerStore = usePlayerStore()

async function fetchSongs() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/songs`)
    songs.value = await res.json()
  } catch (err) {
    error.value = "Erro ao conectar: " + err.message
  } finally {
    loading.value = false
  }
}

const audiosFiltrados = computed(() => {
  return songs.value.filter(song =>
    song.title.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// ESSA É A FUNÇÃO QUE RESOLVE O SEU PROBLEMA
function handlePlay(song) {
  const songUrl = `${STATIC_BASE}/${song.file_path}`
  const audioFisico = document.querySelector('audio') // Pega o áudio que está na SeekBar
  
  if (playerStore.currentSongUrl === songUrl) {
    // Se a música já é a mesma, a gente só pausa ou toca no elemento real
    if (audioFisico.paused) {
      audioFisico.play()
      playerStore.isPlaying = true
    } else {
      audioFisico.pause()
      playerStore.isPlaying = false
    }
  } else {
    // Se for uma música nova, carrega ela
    playerStore.setSongUrl(songUrl)
    playerStore.isPlaying = true
  }
}

onMounted(fetchSongs)

function download(song) {
  const url = `${STATIC_BASE}/${song.file_path}`
  window.open(url, '_blank')
}
</script>

<template>
  <div class="container mt-4">
    <h1 class="mb-4">Catálogo de Músicas</h1>

    <div class="mb-4">
      <input type="text" class="form-control" v-model="searchText" placeholder="Buscar músicas..." />
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div v-for="song in audiosFiltrados" :key="song.id" class="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center">
        <div>
          <div :class="{ 'fw-bold text-primary': playerStore.currentSongUrl?.includes(song.file_path) }">
            {{ song.title }}
          </div>
          <small class="text-muted text-capitalize">Faixa {{ song.track_number }}</small>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="download(song)">⬇</button>
          
          <!-- O BOTÃO QUE VOCÊ QUERIA -->
          <button class="btn btn-primary btn-sm" @click="handlePlay(song)">
            <i class="fa-solid" :class="playerStore.currentSongUrl?.includes(song.file_path) && playerStore.isPlaying ? 'fa-pause' : 'fa-play'"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card { background-color: var(--surface1) !important; color: var(--text); border: none; }
</style>