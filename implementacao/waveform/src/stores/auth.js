// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        loading: true
    }),

    actions: {
        async checkSession() {
            try {
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    credentials: 'include'
                })

                if (response.ok) {
                    const data = await response.json()
                    this.user = data.user,
                    this.role = data.role
                } else {
                    this.user = null
                }

            } catch (err) {
                console.error('Erro ao verificar sessão')
                this.user = null
            } finally {
                this.loading = false
            }
        }
    }
})