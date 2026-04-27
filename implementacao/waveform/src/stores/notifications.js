import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNotificationsStore = defineStore('notifications', () => {
  const lista = ref([])

  function enviarNotificacao(mensagem, tipo = 'info') {
    const id = Date.now()
    lista.value.push({ id, mensagem, tipo })
    setTimeout(() => remover(id), 4000)
  }

  function remover(id) {
    lista.value = lista.value.filter(n => n.id !== id)
  }

  return { lista, enviarNotificacao, remover }
})
