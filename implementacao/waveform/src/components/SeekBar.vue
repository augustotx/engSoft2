<template>
  <div class="seekbar fixed-bottom bg-light py-2 border-top">
    <div class="container">
      <div class="row align-items-center g-2">
        <!-- Cover art -->
        <div class="col-auto">
          <img
            :src="coverArt || '/logoPlaceholder.jpg'"
            alt="Cover"
            style="height: 48px; width: 48px; object-fit: cover;"
            class="rounded"
          />
        </div>
<!-- Track info -->
<div class="col me-auto min-width-0 track-info-col">
  <!-- Title with marquee -->
  <div class="fw-bold position-relative" ref="titleContainer">
    <!-- Hidden measuring span -->
    <span ref="titleMeasure" class="invisible position-absolute" style="white-space: nowrap;">{{ displayTitle }}</span>
    <!-- Marquee container -->
    <div class="marquee-wrapper" :class="{ 'active': titleOverflow }">
      <div class="marquee-content" v-if="titleOverflow" :style="{ animationDuration: titleDuration + 's' }">
        <span>{{ displayTitle }}</span><span>{{ displayTitle }}</span>
      </div>
      <div v-else class="text-truncate">{{ displayTitle }}</div>
    </div>
  </div>

  <!-- Artist with marquee -->
  <div class="text-muted small position-relative" ref="artistContainer">
    <span ref="artistMeasure" class="invisible position-absolute" style="white-space: nowrap;">{{ displayArtist }}</span>
    <div class="marquee-wrapper" :class="{ 'active': artistOverflow }">
      <div class="marquee-content" v-if="artistOverflow" :style="{ animationDuration: artistDuration + 's' }">
        <span>{{ displayArtist }}</span><span>{{ displayArtist }}</span>
      </div>
      <div v-else class="text-truncate">{{ displayArtist }}</div>
    </div>
  </div>
</div>

        <!-- Play/Pause -->
        <div class="col-auto">
          <button
            class="btn btn-sm btn-outline-secondary rounded-circle d-inline-flex align-items-center justify-content-center"
            style="width: 32px; height: 32px; padding: 0;"
            @click="togglePlay"
          >
	  <i class="fa-solid" :class="isPlaying ? 'fa-pause' : 'fa-play'"></i>
          </button>
        </div>

        <!-- Seek bar + volume -->
        <div class="col-12 col-md-7 col-lg-6">
          <div class="d-flex align-items-center gap-2">
            <span class="small text-muted">{{ formatTime(currentTime) }}</span>
            <input
              type="range"
              class="form-range flex-grow-1 seek-range"
              min="0"
              :max="duration || 0"
              step="0.1"
              v-model="seekValue"
              @input="handleSeek"
              @change="handleSeekEnd"
            />
            <span class="small text-muted">{{ formatTime(duration) }}</span>

            <!-- Volume -->
            <div class="d-none d-md-flex align-items-center gap-1 ms-2">
		    <span class="small d-flex align-items-center" style="line-height: 1;"><i class="fa-solid" :class="getVolumeIcon()"></i></span>
              <input
                type="range"
                class="form-range volume-range"
                style="width: 60px; height: 24px;"
                min="0"
                max="1"
                step="0.01"
                v-model="volume"
                @input="updateVolume"
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Audio element (hidden) -->
    <audio
      ref="audioRef"
      :src="audioObjectUrl"
      @timeupdate="onTimeUpdate"
      @loadedmetadata="onLoadedMetadata"
      @ended="onEnded"
    ></audio>
  </div>
</template>
<script setup>
// Esse é o script da SeekBar, que é um componente fixo na parte inferior da tela para controlar a reprodução de áudio.

// Vcs vão perceber que tem algumas variáveis não utilizadas. Eu deixei elas pra compatiblidade, mas não sei se é necessário. Dps a gente testa
// ~augusto
import { ref, onMounted, onBeforeUnmount, watch, computed, nextTick } from 'vue'

const props = defineProps({
  // Arquivo dado pelo usuário (e.g., via input type="file")
  audioFile: {
    type: File,
    default: null
  },
  // URL remoto para o áudio
  audioSrc: {
    type: String,
    default: ''
  }
})

// Metadados
const coverArt = ref(null)
const trackTitle = ref('')
const trackArtist = ref('')
const trackAlbum = ref('')

// Exibições amigáveis
const displayTitle = computed(() => trackTitle.value || 'Título da Música')
const displayArtist = computed(() => {
  if (trackArtist.value && trackAlbum.value) {
    return `${trackArtist.value} – ${trackAlbum.value}`
  } else if (trackArtist.value) {
    return trackArtist.value
  } else if (trackAlbum.value) {
    return trackAlbum.value
  }
  return 'Artista – Álbum'
})

// Áudio e controle
const audioRef = ref(null)
const isPlaying = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const seekValue = ref(0)
const volume = ref(1.0)

// URL do áudio para o elemento <audio>
const audioObjectUrl = ref('')

// Controlador de fetch para abortar requisições anteriores
let currentFetchController = null

// --------------------------------------------------------------
//                     MARQUEE (SCROLLING TEXT)
// --------------------------------------------------------------
// Refs for overflow detection
const titleContainer = ref(null)
const artistContainer = ref(null)
const titleMeasure = ref(null)
const artistMeasure = ref(null)
const titleOverflow = ref(false)
const artistOverflow = ref(false)
const titleDuration = ref(10)
const artistDuration = ref(10)

// Function to check overflow and set durations
function checkOverflow() {
  if (titleMeasure.value && titleContainer.value) {
    const textWidth = titleMeasure.value.offsetWidth
    const containerWidth = titleContainer.value.clientWidth
    titleOverflow.value = textWidth > containerWidth
    console.log('Title overflow:', titleOverflow.value, textWidth, containerWidth);
    if (titleOverflow.value) {
      // Duration proportional to how many times the text is wider (base 5s + extra)
      const ratio = textWidth / containerWidth
      titleDuration.value = Math.max(5, Math.round(ratio * 4))
    }
  }
  if (artistMeasure.value && artistContainer.value) {
    const textWidth = artistMeasure.value.offsetWidth
    const containerWidth = artistContainer.value.clientWidth
    artistOverflow.value = textWidth > containerWidth
    if (artistOverflow.value) {
      const ratio = textWidth / containerWidth
      artistDuration.value = Math.max(5, Math.round(ratio * 4))
    }
  }
}

// Use ResizeObserver to detect container size changes
let resizeObserver
onMounted(() => {
  checkOverflow()
  resizeObserver = new ResizeObserver(() => {
    checkOverflow()
  })
  if (titleContainer.value) resizeObserver.observe(titleContainer.value)
  if (artistContainer.value) resizeObserver.observe(artistContainer.value)
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})

// Re-check when the text changes (e.g., new song loaded)
watch([trackTitle, trackArtist], () => {
  nextTick(() => {
    checkOverflow()
  })
})
// --------------------------------------------------------------

// Formata tempo em segundos para mm:ss
const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds === 0) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

// Analisa metadados de um Blob (arquivo ou resposta fetch)
async function parseMetadataFromBlob(blob) {
  try {
    const mm = await import('https://cdn.jsdelivr.net/npm/music-metadata@10.8.2/+esm')
    const { common, format } = await mm.parseBlob(blob)

    trackTitle.value = common.title || ''
    trackArtist.value = common.artist || ''
    trackAlbum.value = common.album || ''

    if (common.picture && common.picture.length > 0) {
      const picture = common.picture[0]
      const base64String = btoa(String.fromCharCode(...new Uint8Array(picture.data)))
      coverArt.value = `data:${picture.format};base64,${base64String}`
    } else {
      coverArt.value = null
    }

    // Opcionalmente, podemos usar a duração do metadata se disponível,
    // mas o elemento <audio> também vai fornecer isso
    if (format.duration) {
      duration.value = format.duration
    }
  } catch (err) {
    console.error('Metadata parsing failed:', err)
    // Keep existing or empty metadata
  }
}

// Carregar a partir de um arquivo local
async function loadFromFile(file) {
  // Revocar URL antigo
  if (audioObjectUrl.value) {
    URL.revokeObjectURL(audioObjectUrl.value)
    audioObjectUrl.value = ''
  }

  // Resetar metadados
  coverArt.value = null
  trackTitle.value = ''
  trackArtist.value = ''
  trackAlbum.value = ''

  if (!file) return

  try {
    await parseMetadataFromBlob(file)
    audioObjectUrl.value = URL.createObjectURL(file)
  } catch (err) {
    console.error('Failed to process file:', err)
    // Fallback: ainda tentamos criar o URL mesmo sem metadados,
    // para permitir reprodução
    audioObjectUrl.value = URL.createObjectURL(file)
  }
}

// Carregar a partir de uma URL remota
async function loadFromUrl(url) {
  // Abort any ongoing fetch
  if (currentFetchController) {
    currentFetchController.abort()
  }

  // Revocar URL antigo
  if (audioObjectUrl.value) {
    URL.revokeObjectURL(audioObjectUrl.value)
    audioObjectUrl.value = ''
  }

  // Resetar metadados
  coverArt.value = null
  trackTitle.value = ''
  trackArtist.value = ''
  trackAlbum.value = ''

  if (!url) return

  try {
    currentFetchController = new AbortController()
    const response = await fetch(url, { signal: currentFetchController.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const blob = await response.blob()

    await parseMetadataFromBlob(blob)

    // Criar URL para o elemento <audio>
    audioObjectUrl.value = URL.createObjectURL(blob)

    // Aguardar próximo tick para garantir que o src foi atualizado no DOM
    await nextTick()

    // Forçar carregamento da nova fonte
    audioRef.value.load()

    // Remover listeners antigos (se houver) e adicionar um para 'canplay'
    const audio = audioRef.value
    const onCanPlay = () => {
      audio.play().catch(err => console.error('Playback failed:', err))
      isPlaying.value = true
      audio.removeEventListener('canplay', onCanPlay)
    }
    audio.addEventListener('canplay', onCanPlay)

  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Fetch aborted')
    } else {
      console.error('Failed to fetch or parse remote file:', err)
    }
  } finally {
    currentFetchController = null
  }
}

// Esperando mudanças nas props para carregar o áudio
watch(() => props.audioFile, (newFile) => {
  if (newFile) {
    loadFromFile(newFile)
  } else if (props.audioSrc) {
    // Se o arquivo for nulo, mas a URL estiver presente, tenta carregar da URL
    loadFromUrl(props.audioSrc)
  }
}, { immediate: true })

watch(() => props.audioSrc, (newUrl, oldUrl) => {
  console.log('audioSrc changed:', newUrl, oldUrl)
  if (!props.audioFile && newUrl) {
    console.log('calling loadFromUrl')
    loadFromUrl(newUrl)
  }
})

// play/pause
const togglePlay = () => {
  const audio = audioRef.value
  if (!audio) return

  if (isPlaying.value) {
    audio.pause()
  } else {
    audio.play().catch(err => console.error('Playback failed:', err))
  }
  isPlaying.value = !isPlaying.value
}

// Atualizar tempo atual e barra de progresso
const onTimeUpdate = () => {
  const audio = audioRef.value
  if (audio) {
    currentTime.value = audio.currentTime
    if (!seekDragging) {
      seekValue.value = audio.currentTime
    }
  }
}

// Carregar metadados e duração quando o áudio estiver pronto
const onLoadedMetadata = () => {
  const audio = audioRef.value
  if (audio) {
    duration.value = audio.duration
  }
}

// Quando a música termina, resetar estado
const onEnded = () => {
  isPlaying.value = false
  currentTime.value = 0
  seekValue.value = 0
}

// Seeking
let seekDragging = false

const handleSeek = () => {
  seekDragging = true
}

const handleSeekEnd = () => {
  const audio = audioRef.value
  if (audio) {
    audio.currentTime = seekValue.value
    currentTime.value = seekValue.value
  }
  seekDragging = false
}

// Volume
const updateVolume = () => {
  const audio = audioRef.value
  if (audio) {
    audio.volume = volume.value
  }
}

// Ícone de volume baseado no nível
const getVolumeIcon = () => {
  if (volume.value == 0) return 'fa-volume-xmark'
  if (volume.value < 0.65) return 'fa-volume-low'
  return 'fa-volume-high'
}

// Limpar recursos quando o componente for destruído
onBeforeUnmount(() => {
  const audio = audioRef.value
  if (audio) {
    audio.pause()
  }
  if (audioObjectUrl.value) {
    URL.revokeObjectURL(audioObjectUrl.value)
  }
  if (currentFetchController) {
    currentFetchController.abort()
  }
})
</script>
