<template>
  <div class="container mt-4" style="max-width: 600px">

    <div class="search-wrapper mb-4">
      <input
        class="search-input"
        type="text"
        v-model="searchText"
        placeholder="Buscar áudios..."
      />
    </div>

    <AudioCatalog :audios="audiosFiltrados" />

  </div>
</template>

<script setup>
import { ref, computed } from "vue"
import { listarAudios } from "@/services/AudioService"
import AudioCatalog from "@/components/AudioCatalog.vue"

const audios = listarAudios()

const searchText = ref("")

const audiosFiltrados = computed(() => {
  return audios.filter(audio =>
    audio.nome.toLowerCase().includes(searchText.value.toLowerCase())
  )
})
</script>