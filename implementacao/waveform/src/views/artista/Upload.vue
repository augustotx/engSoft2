<template>
  <div class="container mt-4" style="max-width: 800px;">
    <h2 class="fw-bold mb-4 text-primary">Adicionar nova música</h2>
    
    <!-- Mensagem de Sucesso ou Erro -->
    <div v-if="mensagem" class="alert" :class="sucesso ? 'alert-success' : 'alert-danger'">
      {{ mensagem }}
    </div>

    <div class="card border-0 shadow-sm p-4">
      
      <!-- Campo do Título da Música -->
      <div class="mb-4">
        <label class="form-label fw-bold">Título da Música</label>
        <input 
          v-model="titulo" 
          type="text" 
          class="form-control" 
          placeholder="Ex: Minha Nova Obra de Arte"
        >
      </div>

      <!-- Área de Drop/Upload -->
      <div class="drop-zone rounded text-center p-5 mb-4 position-relative">
        <input 
          type="file" 
          accept=".mp3, .flac" 
          @change="onFileSelected"
          class="position-absolute top-0 start-0 w-100 h-100 opacity-0"
          style="cursor: pointer;"
        >
        
        <i class="fa-solid fa-file-audio fs-1 text-secondary mb-3"></i>
        <h5 class="text-dark">Arraste sua música aqui ou clique para buscar</h5>
        <p class="text-muted small mb-0">Apenas arquivos <strong>.mp3</strong> ou <strong>.flac</strong></p>
      </div>

      <!-- Mostra qual arquivo foi selecionado -->
      <div class="alert alert-secondary d-flex align-items-center mb-4">
        <i class="fa-solid fa-music me-3 text-primary"></i>
        <span class="text-muted fst-italic" v-if="!arquivo">Nenhum arquivo selecionado...</span>
        <span class="text-dark fw-bold" v-else>{{ arquivo.name }}</span>
      </div>

      <!-- Botões de Ação -->
      <div class="d-flex justify-content-end gap-3">
        <button class="btn btn-outline-danger" @click="apagarArquivo" :disabled="carregando">
          <i class="fa-solid fa-trash me-2"></i> Apagar arquivo
        </button>
        <button class="btn btn-primary px-4" @click="fazerUpload" :disabled="!arquivo || !titulo || carregando">
          <span v-if="carregando" class="spinner-border spinner-border-sm me-2"></span>
          <i v-else class="fa-solid fa-cloud-arrow-up me-2"></i> 
          {{ carregando ? 'Enviando...' : 'Fazer upload' }}
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const titulo = ref('')
const arquivo = ref(null)
const mensagem = ref('')
const sucesso = ref(false)
const carregando = ref(false)

// Pega o arquivo quando o usuário seleciona do computador
const onFileSelected = (event) => {
  const file = event.target.files[0]
  if (file && (file.type === 'audio/mpeg' || file.name.endsWith('.flac') || file.name.endsWith('.mp3'))) {
    arquivo.value = file
    mensagem.value = '' 
  } else {
    mensagem.value = "Por favor, selecione apenas arquivos .mp3 ou .flac."
    sucesso.value = false
    arquivo.value = null
  }
}

// Limpa os campos
const apagarArquivo = () => {
  arquivo.value = null
  titulo.value = ''
  mensagem.value = ''
}

// Lógica real que envia para o Back-end
const fazerUpload = async () => {
  if (!arquivo.value || !titulo.value) return

  carregando.value = true
  mensagem.value = ''

  // Prepara os dados para envio
  const formData = new FormData()
  formData.append('file', arquivo.value)
  formData.append('title', titulo.value)
  formData.append('artist_id', authStore.user.id) // Vincula a música ao artista logado

  try {
    const res = await fetch('http://localhost:3000/api/songs/upload', {
      method: 'POST',
      body: formData 
    })

    if (res.ok) {
      mensagem.value = "Música adicionada ao catálogo com sucesso!"
      sucesso.value = true
      apagarArquivo() // Limpa os campos para a próxima música
    } else {
      const err = await res.json()
      mensagem.value = "Erro: " + (err.error || "Falha ao enviar.")
      sucesso.value = false
    }
  } catch (error) {
    mensagem.value = "Erro de conexão com o servidor."
    sucesso.value = false
  } finally {
    carregando.value = false
  }
}
</script>

<style scoped>
.drop-zone {
  background-color: #e9ecef;
  border: 2px dashed #adb5bd;
  transition: all 0.3s ease;
}

.drop-zone:hover {
  border-color: var(--bs-primary);
  background-color: #dee2e6;
}
</style>