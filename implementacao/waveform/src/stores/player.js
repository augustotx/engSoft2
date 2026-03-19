import { defineStore } from 'pinia'
import { ref } from 'vue'

export const usePlayerStore = defineStore('player', () => {
  const currentSongUrl = ref('')
  function setSongUrl(url) {
    currentSongUrl.value = url
  }
  return { currentSongUrl, setSongUrl }
})
