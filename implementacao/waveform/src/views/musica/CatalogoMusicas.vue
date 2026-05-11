<script setup>
import { ref, onMounted, computed } from "vue"
import { useRouter } from 'vue-router'
import { usePlayerStore } from '@/stores/player'
import { useNotificationsStore } from '../../stores/notifications'
import { useAuthStore } from '../../stores/auth'  // 👈 adicionado

const router = useRouter()
const authStore = useAuthStore()  // 👈 instância do store

const songs = ref([])
const playlists = ref([])
const loading = ref(true)
const searchText = ref("")
const showPlaylistModal = ref(false)
const selectedSong = ref(null)

const API_BASE = 'http://127.0.0.1:3000/api'
const STATIC_BASE = 'http://127.0.0.1:3000'
const userId = 1

const playerStore = usePlayerStore()
const notificationsStore = useNotificationsStore()

// 👈 Rota do perfil baseada na role do usuário logado
const profileRoute = computed(() => {
  if (!authStore.user) return null
  return authStore.user.role === 'users' ? '/ouvinte/perfil' : '/artista/perfil'
})

async function fetchSongs() {
  loading.value = true
  try {
    const res = await fetch(`${API_BASE}/songs`)
    songs.value = await res.json()
  } catch (err) { console.error(err) }
  finally { loading.value = false }
}

async function fetchUserPlaylists() {
  try {
    const res = await fetch(`${API_BASE}/users/${userId}/playlists`)
    const dados = await res.json()
    const playlistsComMusicas = await Promise.all(dados.map(async (p) => {
      const detalheRes = await fetch(`${API_BASE}/playlists/${p.id}`)
      return await detalheRes.json()
    }))
    playlists.value = playlistsComMusicas
  } catch (err) { console.error(err) }
}

const playlistsParaAdicionar = computed(() => {
  if (!selectedSong.value) return []
  return playlists.value.filter(p => {
    const musicasNaPalylist = p.songs || []
    return !musicasNaPalylist.some(s => s.id === selectedSong.value.id)
  })
})

function abrirModalPlaylist(song) {
  selectedSong.value = song
  showPlaylistModal.value = true
  fetchUserPlaylists()
}

async function adicionarAFila(songPlaylistId) {
  try {
    const res = await fetch(`${API_BASE}/playlist_songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playlist_id: songPlaylistId,
        song_id: selectedSong.value.id
      })
    })

    if (res.ok) {
      const playlistAfetada = playlists.value.find(p => p.id === songPlaylistId)
      if (playlistAfetada) {
        if (!playlistAfetada.songs) playlistAfetada.songs = []
        playlistAfetada.songs.push({ id: selectedSong.value.id })
      }


    } else {
      notificationsStore.enviarNotificacao('Erro ao adicionar', 'erro')
    }
  } catch (err) {
    notificationsStore.enviarNotificacao('Erro na conexão', 'erro')
  }
}

function handlePlay(song) {
  const songUrl = `${STATIC_BASE}/${song.file_path}`
  const audio = document.querySelector('audio')
  if (playerStore.currentSongUrl === songUrl) {
    playerStore.isPlaying ? audio.pause() : audio.play()
    playerStore.isPlaying = !playerStore.isPlaying
  } else {
    playerStore.setSongUrl(songUrl)
    playerStore.isPlaying = true
  }
}

function download(song) { window.open(`${STATIC_BASE}/${song.file_path}`, '_blank') }

const audiosFiltrados = computed(() => {
  return songs.value.filter(song => song.title.toLowerCase().includes(searchText.value.toLowerCase()))
})

onMounted(() => {
  fetchSongs()
  authStore.checkSession() // 👈 verifica sessão ao carregar a página
})
</script>

<template>
  <div class="container mt-4">
    <!-- Cabeçalho com título e botão de perfil -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h1 class="mb-0">Catálogo de Músicas</h1>
      <button v-if="authStore.user && profileRoute" class="btn btn-outline-primary" @click="router.push(profileRoute)">
        <i class="fa-regular fa-user me-1"></i> Meu Perfil
      </button>
    </div>

    <!-- Busca -->
    <div class="mb-4">
      <input type="text" class="form-control" v-model="searchText" placeholder="Buscar músicas..." />
    </div>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
    </div>

    <div v-else>
      <div v-for="song in audiosFiltrados" :key="song.id"
        class="card p-3 mb-2 d-flex flex-row justify-content-between align-items-center">
        <div>
          <div class="fw-bold text-primary text-uppercase">{{ song.title }}</div>
          <small class="text-muted">Faixa {{ song.track_number }}</small>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-sm btn-outline-secondary" @click="download(song)"><i
              class="fa-solid fa-download"></i></button>
          <button class="btn btn-sm btn-outline-secondary" @click="abrirModalPlaylist(song)"><i
              class="fa-solid fa-plus"></i></button>
          <button class="btn btn-primary btn-sm" @click="handlePlay(song)">
            <i class="fa-solid"
              :class="playerStore.currentSongUrl?.includes(song.file_path) && playerStore.isPlaying ? 'fa-pause' : 'fa-play'"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div v-if="showPlaylistModal" class="modal-overlay">
      <div class="modal-content card p-4 shadow-lg border-primary">
        <h5 class="text-center text-primary mb-3">Adicionar à Playlist</h5>
        <div class="modal-body custom-scroll">
          <div class="d-flex flex-column gap-2">
            <button v-for="p in playlistsParaAdicionar" :key="p.id" class="btn playlist-btn"
              @click="adicionarAFila(p.id)">
              {{ p.name }}
            </button>
          </div>
          <div v-if="playlistsParaAdicionar.length === 0" class="text-center py-4 text-muted">
            Sem playlists disponíveis.
          </div>
        </div>
        <button class="btn btn-secondary w-100 mt-3" @click="showPlaylistModal = false">Pronto</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: var(--surface1) !important;
  color: var(--text);
  border: none;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1050;
}

.modal-content {
  width: 90%;
  max-width: 380px;
  background-color: var(--surface1) !important;
  border: 1px solid var(--primary);
}

.playlist-btn {
  background-color: var(--surface2) !important;
  color: var(--text) !important;
  border: 1px solid var(--border) !important;
  padding: 12px;
  font-weight: bold;
  transition: all 0.2s ease;
}

.playlist-btn:hover {
  background-color: var(--primary) !important;
  color: white !important;
  transform: translateY(-2px);
}

.custom-scroll {
  max-height: 300px;
  overflow-y: auto;
  padding-right: 5px;
}
</style>