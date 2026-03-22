<script setup>
import SeekBar from './SeekBar.vue';
import { usePlayerStore } from '../stores/player';
const playerStore = usePlayerStore();
</script>

<template>
  <div class="d-flex flex-column" style="min-height: calc(100vh - 4rem);">
  <!-- NAVBAR -->
  <!-- a primeira navbar é pra PC, a segunda pra mobile -->
  <div class="navbar navbar-expand-lg d-none d-lg-flex pc-navbar">
    <div class="container">
      <!-- É UM PLACEHOLDER, NÃO TEM LOGO AINDA -->
      <router-link class="navbar-brand" to="/musicas">
      <img src="/logoPlaceholder.jpg" alt="Logo">
      </router-link>

      <!-- links -->
      <router-link class="navbar-brand" to="/musicas">Catálogo</router-link>
      <router-link class="navbar-brand" to="/artistas">Artistas</router-link>
      <router-link class="navbar-brand" to="/playlists">Playlists</router-link>
      <router-link class="navbar-brand" to="/ouvinte/login">Login</router-link>
    </div>
  </div>
  <div class="navbar navbar-expand-lg d-flex d-lg-none">
    <div class="container">
      <!-- pra caber os links na tela, nao vai ter logo e o texto vai ser menor -->
      <!-- idealmente isso seriam ícones -->
      <router-link class="navbar-brand fs-6" to="/musicas">Catálogo</router-link>
      <router-link class="navbar-brand fs-6" to="/artistas">Artistas</router-link>
      <router-link class="navbar-brand fs-6" to="/playlists">Playlists</router-link>
      <router-link class="navbar-brand fs-6" to="/ouvinte/login">Login</router-link>
    </div>
  </div>
  <!-- NAVBAR END -->

  <!-- CONTEÚDO PRINCIPAL -->
  <!-- o container principal e o router-view tem flex-grow-1 pra ocupar o espaço restante da tela, empurrando o footer pra baixo -->
  <!-- ao que tudo me consta, se precisar de mais espaço que a tela, o conteúdo vai crescer e o footer vai ficar no final do conteúdo, não da tela -->
  <div class="container flex-grow-1 d-flex flex-column main-content">
  <!-- div de margem superior pra dar um espaço entre a navbar e o conteúdo -->
  <div style="height: 2rem;"></div>
  <router-view class="flex-grow-1" />
  </div>
  <!-- div de margem inferior pra dar um espaço entre o conteúdo e a seekbar -->
  <div style="height: 5rem;"></div>
  <div style="height: 5rem;"></div>
  <!-- CONTEÚDO PRINCIPAL END -->
  <!-- SEEKBAR -->
  <!-- audioSrc é a fonte do áudio, que pode ser um arquivo local ou uma URL -->
  <!-- se você botar /outofbodyexperience.flac, tem que ter uma música minha
  na pasta public do projeto com esse nome. a SeekBar vai pegar os metadados
  do arquivo e mostrar a duração, e vai tocar, etc. ~augusto -->
  <SeekBar
    :audioSrc="playerStore.currentSongUrl"
  />
</div>
</template>

<script>
// funcao auxiliar pra setar o tamanho do logo, porque o height do navbar é fixo e a altura
// do logo tem que ser um pouco menor que a altura do navbar pra caber dentro dele
function setLogoSize() {
    const logo = document.querySelector('.pc-navbar img');
    const navbar = document.querySelector('.pc-navbar');
    logo.style.height = navbar.offsetHeight - 16 + 'px'; // 16px é a margem vertical do logo
    console.log('Logo height set to: ' + logo.style.height);
}
export default {
  mounted() {
    setLogoSize();
    // também tem que ajustar o tamanho do logo quando a janela for redimensionada, pra manter o logo do tamanho certo
    window.addEventListener('resize', setLogoSize);
  }
}
</script>
