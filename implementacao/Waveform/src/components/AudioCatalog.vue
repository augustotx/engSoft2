<script setup>
import { ref, defineProps } from "vue"

const props = defineProps({
  audios: Array
})

const ativoId = ref(null)
const tocando = ref(false)

function tocar(audio) {
  if (ativoId.value === audio.id) {
    tocando.value = !tocando.value
  } else {
    ativoId.value = audio.id
    tocando.value = true
  }

  console.log("Tocando áudio:", audio.nome)
}
</script>

<template>
  <div>
    <div
      class="audio-item mb-2 d-flex align-items-center justify-content-between"
      v-for="audio in audios"
      :key="audio.id"
    >

      <div :style="{ color: ativoId === audio.id ? 'var(--accent-blue)' : 'var(--text-main)' }">
        <div>{{ audio.nome }}</div>
        <small class="text-secondary">{{ audio.tipo }} • {{ audio.duracao }}</small>
      </div>

      <button class="btn btn-primary btn-sm" @click="tocar(audio)">
        {{ ativoId === audio.id && tocando ? '⏸' : '▶' }}
      </button>
    </div>
  </div>
</template>