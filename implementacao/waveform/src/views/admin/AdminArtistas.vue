<script setup lang="ts">
import { ref, onMounted } from 'vue'

const artistas = ref<any[]>([])
const mensagem = ref('')

const buscarPendentes = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/admin/artists/pending')
    if (res.ok) {
      artistas.value = await res.json()
    }
  } catch (error) {
    mensagem.value = "Erro ao buscar artistas pendentes."
    console.error(error)
  }
}

const atualizarStatus = async (userId: number, status: string) => {
  try {
    const res = await fetch(`http://localhost:3000/api/admin/artists/${userId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    
    const data = await res.json()
    mensagem.value = data.message || data.error
    
    if (res.ok) {
      await buscarPendentes() // atualiza a lista só se deu certo
    }
  } catch (error) {
    mensagem.value = "Erro de conexão ao atualizar status."
    console.error(error)
  }
}

// Helper para exibir a imagem corretamente (local ou URL externa do Google)
const getImageUrl = (path: string) => {
  if (path.startsWith('http')) return path
  return `http://localhost:3000/${path}`
}

onMounted(buscarPendentes)
</script>

<template>
  <div class="container py-5">
    
    <!-- Botão de Voltar para a Landing Page -->
    <router-link to="/" class="btn btn-outline-secondary mb-4">
      &larr; Voltar para o Início
    </router-link>

    <h2 class="fw-bold mb-4">Artistas Pendentes</h2>

    <div v-if="mensagem" class="alert alert-info py-2 mb-4">{{ mensagem }}</div>

    <div v-if="artistas.length === 0" class="text-secondary">
      Nenhum artista aguardando aprovação.
    </div>

    <div v-for="artista in artistas" :key="artista.id" class="card mb-3 p-4">
      <h5 class="fw-bold mb-1">{{ artista.name }}</h5>
      <p class="text-secondary small mb-1">@{{ artista.username }} — {{ artista.email }}</p>
      <p class="mb-2" v-if="artista.bio">{{ artista.bio }}</p>
      
      <img 
        v-if="artista.picture_path" 
        :src="getImageUrl(artista.picture_path)" 
        style="height: 80px; width: 80px; object-fit: cover;" 
        class="rounded mb-3"
      >

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