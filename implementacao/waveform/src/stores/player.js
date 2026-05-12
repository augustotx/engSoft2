import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSongUrl = ref('')
  const currentSongId = ref(null)
  const isPlaying = ref(false)
  const queue = ref([])
  const currentIndex = ref(0)

  function setSongUrl(url) {
    currentSongUrl.value = url
  }

  function setSongId(id) {
    currentSongId.value = id
  }

  function setQueue(songs, index) {
    queue.value = songs
    currentIndex.value = index
  }

  function playNext() {
    if (queue.value.length > 0 && currentIndex.value < queue.value.length - 1) {
      currentIndex.value++ 
      const nextSong = queue.value[currentIndex.value]
      
      currentSongId.value = nextSong.id
      currentSongUrl.value = `http://127.0.0.1:3000/${nextSong.file_path}` 
      isPlaying.value = true

      fetch(`http://127.0.0.1:3000/api/songs/${nextSong.id}/stream`, { method: 'POST' })
        .catch(e => console.error("Erro ao registrar stream no auto-play:", e))
      
      setTimeout(() => {
          const audio = document.querySelector('audio')
          if (audio) audio.play()
      }, 50)
    } else {
      isPlaying.value = false
    }
  }

  // 👇 NOVA FUNÇÃO PARA ZERAR TUDO NO LOGOUT
  function resetPlayer() {
    currentSongUrl.value = ''
    currentSongId.value = null
    isPlaying.value = false
    queue.value = []
    currentIndex.value = 0
  }

  return { 
    currentSongUrl, 
    currentSongId, 
    isPlaying,
    queue,
    currentIndex,
    setSongUrl, 
    setSongId,
    setQueue,
    playNext,
    resetPlayer 
  }
})