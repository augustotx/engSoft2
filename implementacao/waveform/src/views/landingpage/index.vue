<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from '../../stores/auth.js'

const authStore = useAuthStore()

onMounted(() => {
  authStore.checkSession()
})
</script>

<template>
  <div class="d-flex flex-column align-items-center justify-content-center vh-100">
    <h1>Bem-vindo!</h1>

    <div class="d-flex gap-3 mt-4">
      <router-link to="/ouvinte/cadastro" class="btn btn-primary btn-lg">
        Sou Ouvinte
      </router-link>

      <router-link to="/artista/cadastro" class="btn btn-primary btn-lg">
        Sou Artista
      </router-link>
    </div>

    <!-- teste de sessao -->
    <div v-if="authStore.user" class="mt-4">
      Logado como {{ authStore.user.username }}
      {{ authStore.user.role }}
    </div>

    <div v-else class="mt-4">
      Não está logado
    </div>

    <!-- Atalho para o Admin -->
    <div class="mt-5">
      <router-link to="/admin/artistas" class="text-secondary text-decoration-none small opacity-75 custom-hover">
        <i class="fa-solid fa-lock me-1"></i> Entrar como Administrador
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.custom-hover:hover {
  text-decoration: underline !important;
  opacity: 1 !important;
}
</style>