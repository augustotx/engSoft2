<script setup lang="ts">
import LoginTemplate from '@/views/templates/Login.vue'
</script>

<template>
  <LoginTemplate
    titulo="Logar como Ouvinte"
    cadastro-link="/ouvinte/cadastro"
    redirect-to="/musicas"
  />
</template>