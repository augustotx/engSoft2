<script setup lang="ts">
import { ref, onMounted } from 'vue'

const artistas = ref([])
const mensagem = ref('')

const buscarPendentes = async () => {
  const res = await fetch('http://localhost:3000/api/admin/artists/pending')
  artistas.value = await res.json()
}

const atualizarStatus = async (userId: number, status: string) => {
  const res = await fetch(`http://localhost:3000/api/admin/artists/${userId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
  const data = await res.json()
  mensagem.value = data.message || data.error
  await buscarPendentes() // atualiza a lista
}

onMounted(buscarPendentes)
</script>

<template>
  <div class="container py-5">
    <h2 class="fw-bold mb-4">Artistas Pendentes</h2>

    <div v-if="mensagem" class="alert alert-info py-2 mb-4">{{ mensagem }}</div>

    <div v-if="artistas.length === 0" class="text-secondary">
      Nenhum artista aguardando aprovação.
    </div>

    <div v-for="artista in artistas" :key="artista.id" class="card mb-3 p-4">
      <h5 class="fw-bold mb-1">{{ artista.name }}</h5>
      <p class="text-secondary small mb-1">@{{ artista.username }} — {{ artista.email }}</p>
      <p class="mb-2" v-if="artista.bio">{{ artista.bio }}</p>
      <img v-if="artista.picture_path" :src="artista.picture_path" style="height: 80px; width: 80px; object-fit: cover;" class="rounded mb-3">

      <div class="d-flex gap-2">
        <button class="btn btn-success btn-sm" @click="atualizarStatus(artista.id, 'approved')">
          Aprovar
        </button>
        <button class="btn btn-danger btn-sm" @click="atualizarStatus(artista.id, 'rejected')">
          Rejeitar
        </button>
      </div>
    </div>
  </div>
</template>
