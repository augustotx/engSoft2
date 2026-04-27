<script setup>
import { useNotificationsStore } from './stores/notifications'
const notificationsStore = useNotificationsStore()
</script>

<template>
  <router-view />

  <!-- TOASTS DE NOTIFICAÇÃO -->
  <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 9999">
    <div v-for="notif in notificationsStore.lista" :key="notif.id" class="toast show" :class="{
      'bg-danger text-white': notif.tipo === 'erro',
      'bg-success text-white': notif.tipo === 'sucesso',
      'bg-info text-white': notif.tipo === 'info'
    }">
      <div class="toast-body d-flex justify-content-between align-items-center">
        {{ notif.mensagem }}
        <button type="button" class="btn-close btn-close-white ms-2"
          @click="notificationsStore.remover(notif.id)"></button>
      </div>
    </div>
  </div>
</template>