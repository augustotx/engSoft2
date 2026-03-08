<template>
  <div class="container mt-4" style="max-width: 600px">
    <h2 class="mb-4">Áudios</h2>
    <!-- Componente filho recebe os áudios -->
    <AudioCatalog :audios="audios" />
  </div>
</template>

<script setup>
import { listarAudios } from "@/services/AudioService"
import AudioCatalog from "@/components/AudioCatalog.vue"

const audios = listarAudios()
</script>