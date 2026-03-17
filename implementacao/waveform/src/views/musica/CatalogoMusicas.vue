<script setup>
import { ref, computed } from "vue"

/* ===== AUDIO SERVICE ===== */
const audios = [
  { id: 1, nome: "Schism", duracao: "6:47", tipo: "música", url: "/audios/Schism.mp3" },
  { id: 2, nome: "The Pot", duracao: "6:22", tipo: "música", url: "/audios/The_Pot.mp3" }
]

function listarAudios() {
  return audios
}

let player = null

// Tem que implementar ela de verdade ainda

function tocarAudio(audio) {
  if (player) player.pause()
  player = new Audio(audio.url)
  player.play()
}


const listaAudios = listarAudios()

// Search Bar config
const searchText = ref("")

const audiosFiltrados = computed(() => {
  return listaAudios.filter(audio =>
    audio.nome.toLowerCase().includes(searchText.value.toLowerCase())
  )
})

// player state
const ativoId = ref(null)
const tocando = ref(false)

function tocar(audio) {
  if (ativoId.value === audio.id) {
    if (tocando.value) {
      player.pause()
      tocando.value = false
    } else {
      player.play()
      tocando.value = true
    }
  } else {
    ativoId.value = audio.id
    tocando.value = true
    tocarAudio(audio)
  }
}

function download(audio) {
  console.log("Baixando:", audio.nome)
}
</script>

<template>
  <div class="container mt-4">

    <h1 class="mb-4">Catálogo de Músicas</h1>

    <!-- BUSCA -->
    <div class="mb-4">
      <input
        type="text"
        class="form-control"
        v-model="searchText"
        placeholder="Buscar músicas..."
      />
    </div>

    <!-- LISTA -->
    <div
      v-for="audio in audiosFiltrados"
      :key="audio.id"
      class="card d-flex flex-row justify-content-between align-items-center"
    >
      <!-- INFO -->
      <div>
        <div
          :style="{
            color: ativoId === audio.id ? 'var(--mauve)' : 'var(--text)'
          }"
        >
          {{ audio.nome }}
        </div>

        <small style="color: var(--subtext0)">
          {{ audio.tipo }} • {{ audio.duracao }}
        </small>
      </div>

      <!-- AÇÕES -->
      <div class="d-flex align-items-center gap-2">

        <button class="btn btn-sm btn-secondary">
          +
        </button>

        <button
          class="btn btn-sm btn-secondary"
          @click="download(audio)"
        >
          ⬇
        </button>

        <button
          class="btn btn-primary btn-sm"
          @click="tocar(audio)"
        >
          {{ ativoId === audio.id && tocando ? '⏸' : '▶' }}
        </button>

      </div>
    </div>



  </div>
</template>