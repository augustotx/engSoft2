<script setup>
import SeekBar from './SeekBar.vue';
import { usePlayerStore } from '../stores/player';
import { useAuthStore } from '../stores/auth';
import { useRouter } from 'vue-router';

const playerStore = usePlayerStore();
const authStore = useAuthStore();
const router = useRouter();

async function logout() {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <div class="d-flex flex-column" style="min-height: calc(100vh - 4rem);">
  <!-- NAVBAR -->
  <div class="navbar navbar-expand-lg d-none d-lg-flex pc-navbar">
    <div class="container">
      <router-link class="navbar-brand" to="/musicas">
        <img src="/logoPlaceholder.jpg" alt="Logo">
      </router-link>
      <router-link class="navbar-brand" to="/musicas">Catálogo</router-link>
      <router-link class="navbar-brand" to="/artistas">Artistas</router-link>
      <router-link class="navbar-brand" to="/playlists">Playlists</router-link>
      <button v-if="authStore.isAuthenticated" class="btn btn-outline-secondary btn-sm ms-auto" @click="logout">
        Sair
      </button>
    </div>
  </div>
  <div class="navbar navbar-expand-lg d-flex d-lg-none">
    <div class="container">
      <router-link class="navbar-brand fs-6" to="/musicas">Catálogo</router-link>
      <router-link class="navbar-brand fs-6" to="/artistas">Artistas</router-link>
      <router-link class="navbar-brand fs-6" to="/playlists">Playlists</router-link>
      <button v-if="authStore.isAuthenticated" class="btn btn-outline-secondary btn-sm ms-auto" @click="logout">
        Sair
      </button>
    </div>
  </div>
  <!-- NAVBAR END -->

  <div class="container flex-grow-1 d-flex flex-column main-content">
    <div style="height: 2rem;"></div>
    <router-view class="flex-grow-1" />
  </div>
  <div style="height: 5rem;"></div>
  <div style="height: 5rem;"></div>

  <SeekBar :audioSrc="playerStore.currentSongUrl" />
</div>
</template>

<script>
function setLogoSize() {
    const logo = document.querySelector('.pc-navbar img');
    const navbar = document.querySelector('.pc-navbar');
    logo.style.height = navbar.offsetHeight - 16 + 'px';
}
export default {
  mounted() {
    setLogoSize();
    window.addEventListener('resize', setLogoSize);
  }
}
</script>
