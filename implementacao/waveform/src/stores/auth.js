// src/stores/auth.js
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,     // { id, email, username, name, picture_path, role }
        loading: true,
        isPremium: false
    }),

    getters: {
        isAuthenticated: (state) => !!state.user,
        isArtist: (state) => state.user?.role === 'artists',
        isUser: (state) => state.user?.role === 'users'
    },

    actions: {
        // Verifica sessão atual com o backend
        async checkSession() {
            try {
                const response = await fetch('http://localhost:3000/api/auth/me', {
                    credentials: 'include'  // envia o cookie da sessão
                })
                if (response.ok) {
                    const data = await response.json()
                    this.user = data.user   // data.user já contém o campo 'role'
                    this.isPremium = data.user.is_premium ?? false
                } else {
                    this.user = null
                    this.isPremium = false
                }
            } catch (err) {
                console.error('Erro ao verificar sessão:', err)
                this.user = null
                this.isPremium = false
            } finally {
                this.loading = false
            }
        },

        // Login tradicional (e-mail/senha)
        async login(email, password, role) {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ email, password, role })
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro no login')
            }
            const data = await response.json()
            this.user = data.user
            this.isPremium = data.user.is_premium ?? false
            return data
        },

        // Login com Google (após receber o token do frontend)
        async googleLogin(credential, username = null, role = null, bio = null, picture_path = null) {
            const payload = { credential }
            if (username) payload.username = username
            if (role) payload.role = role
            if (bio) payload.bio = bio
            if (picture_path) payload.picture_path = picture_path

            const response = await fetch('http://localhost:3000/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload)
            })
            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.error || 'Erro na autenticação Google')
            }
            const data = await response.json()
            this.user = data.user
            this.isPremium = data.user.is_premium ?? false
            return data
        },

        // Logout
        async logout() {
            const response = await fetch('http://localhost:3000/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            if (response.ok) {
                this.user = null
                this.isPremium = false
            } else {
                console.error('Erro no logout')
            }
        }
    }
})
