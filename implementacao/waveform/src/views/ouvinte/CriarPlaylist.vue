<template>
  <div class="row h-100 g-0">
    <div class="col-sm-12 col-md-8 col-lg-6 mx-auto my-auto">
      <div class="card p-4 p-md-5">
        <h1 class="h4 text-center mb-4">Crie uma nova Playlist</h1>

        <form @submit.prevent="onSubmit">
          <div class="mb-3">
            <label for="nome" class="form-label">Nome da Playlist</label>
            <input v-model="nome" type="text" id="nome" class="form-control" required />
          </div>

          <div class="d-grid">
            <button type="submit" class="btn btn-primary">Criar Playlist</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const nome = ref('')

function onSubmit() {
  console.log('Criando playlist:', nome.value)
}
</script>
