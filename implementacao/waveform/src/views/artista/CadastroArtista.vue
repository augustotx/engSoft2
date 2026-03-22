<script setup lang="ts">
import CadastroCard from '@/views/templates/Cadastro.vue'
</script>

<template>
  <CadastroCard
    titulo="Crie sua Conta de Artista"
    login-link="/artista/login"
    redirect-to="/artista"
    :mostrarDicaUsername = "true"
  />
</template>