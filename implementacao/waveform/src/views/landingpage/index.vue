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
  </div>
</template>