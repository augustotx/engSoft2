<template>
  <div class="container mt-4">
    <button class="btn btn-outline-primary mb-4" @click="router.back()">
      &larr; Voltar
    </button>

    <div v-if="loading" class="text-center my-5">
      <div class="spinner-border text-primary"></div>
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
        <!-- Componente Draggable envolvendo as músicas -->
        <draggable 
          v-model="playlist.songs" 
          item-key="id"
          @end="salvarNovaOrdem"
          animation="200"
          handle=".drag-handle"
        >
          <template #item="{ element: song, index }">
            <div class="card p-3 mb-2 flex-row justify-content-between align-items-center">
              
              <div class="d-flex align-items-center">
                <!-- Ícone para arrastar -->
                <i class="fa-solid fa-grip-vertical text-muted me-3 drag-handle fs-5" title="Arraste para reordenar"></i>
                
                <span class="text-muted me-3" style="min-width: 20px;">{{ index + 1 }}</span>
                <span :class="{ 'fw-bold text-primary': playerStore.currentSongUrl?.includes(song.file_path) }">
                  {{ song.title }}
                </span>
              </div>

              <div class="d-flex gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click="download(song)">
                  <i class="fa-solid fa-download"></i>
                </button>

                <button class="btn btn-sm btn-outline-secondary btn-remover" @click="removerMusica(song.id)" title="Remover música">
                  <i class="fa-solid fa-minus"></i>
                </button>
                
                <!-- AQUI: Passando o index para a função tocarMusica -->
                <button class="btn btn-sm btn-primary" @click="tocarMusica(song, index)">
                   <i class="fa-solid" :class="playerStore.currentSongUrl?.includes(song.file_path) && playerStore.isPlaying ? 'fa-pause' : 'fa-play'"></i>
                </button>
              </div>
            </div>
          </template>
        </draggable>
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
import { useNotificationsStore } from '../../stores/notifications'
import { usePlayerStore } from '@/stores/player'
import draggable from 'vuedraggable' 

const route = useRoute()
const router = useRouter()
const notificationsStore = useNotificationsStore()
const playerStore = usePlayerStore()

const playlist = ref(null)
const loading = ref(true)

const API_BASE = 'http://127.0.0.1:3000/api'
const STATIC_BASE = 'http://127.0.0.1:3000'

async function fetchPlaylistDetails() {
  loading.value = true
  try {
    const id = route.params.id
    const res = await fetch(`${API_BASE}/playlists/${id}`)
    if (!res.ok) throw new Error('Falha ao carregar')
    playlist.value = await res.json()
  } catch (err) {
    notificationsStore.enviarNotificacao('Erro ao carregar a playlist.', 'erro')
  } finally {
    loading.value = false
  }
}

async function salvarNovaOrdem() {
  const novaOrdemIds = playlist.value.songs.map(song => song.id);

  try {
    await fetch(`${API_BASE}/playlists/${route.params.id}/reorder`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ novaOrdem: novaOrdemIds })
    });
  } catch (err) {
    notificationsStore.enviarNotificacao('Erro ao salvar nova ordem.', 'erro');
  }
}

// 👇 NOVA FUNÇÃO: Dispara a rota de registrar stream no banco
async function registrarStream(songId) {
  try {
    await fetch(`${API_BASE}/songs/${songId}/stream`, { method: 'POST' })
  } catch (error) {
    console.error("Erro ao registrar stream:", error)
  }
}

// 👇 ATUALIZADO: Recebe o index e avisa a fila e o banco de dados
function tocarMusica(song, index) {
  const songUrl = `${STATIC_BASE}/${song.file_path}`
  const audioFisico = document.querySelector('audio')
  
  // Salva a lista de músicas para a próxima tocar sozinha
  playerStore.setQueue(playlist.value.songs, index)
  
  if (playerStore.currentSongUrl === songUrl) {
    if (playerStore.isPlaying) {
      audioFisico.pause()
      playerStore.isPlaying = false
    } else {
      audioFisico.play()
      playerStore.isPlaying = true
    }
  } else {
    // Registra a stream por ser uma música nova!
    registrarStream(song.id)
    if (playerStore.setSongId) playerStore.setSongId(song.id)
    playerStore.setSongUrl(songUrl)
    playerStore.isPlaying = true
  }
}

function download(song) {
  const url = `${STATIC_BASE}/${song.file_path}`
  window.open(url, '_blank')
}

async function removerMusica(songId) {
  try {
    const res = await fetch(`${API_BASE}/playlist_songs`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        playlist_id: route.params.id,
        song_id: songId
      })
    });

    if (res.ok) {
      playlist.value.songs = playlist.value.songs.filter(s => s.id !== songId);
    } else {
      notificationsStore.enviarNotificacao('Erro ao remover música.', 'erro');
    }
  } catch (err) {
    notificationsStore.enviarNotificacao('Erro de conexão.', 'erro');
  }
}

onMounted(fetchPlaylistDetails)
</script>

<style scoped>
.card { 
  background-color: var(--surface1) !important; 
  color: var(--text); 
  border: none; 
}

.btn-remover {
  transition: all 0.3s ease;
}

.btn-remover:hover {
  background-color: var(--red) !important;
  border-color: var(--red) !important;
  color: var(--base) !important; 
}

.drag-handle {
  cursor: grab;
  transition: color 0.2s;
}

.drag-handle:hover {
  color: var(--primary) !important;
}

.drag-handle:active {
  cursor: grabbing;
}
</style>