import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSongUrl = ref('')
  const currentSongId = ref(null)

  function setSongUrl(url) {
    currentSongUrl.value = url
  }

  function setSongId(id) {
    currentSongId.value = id
  }

  return { currentSongUrl, currentSongId, setSongUrl, setSongId }
})
