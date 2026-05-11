import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from '@/stores/auth'
import MainLayout from "@/components/MainLayout.vue"
import LandingPage from "@/views/landingpage/index.vue"

import LoginOuvinte from "@/views/ouvinte/LoginOuvinte.vue"
import RegisterListener from "@/views/ouvinte/CadastroOuvinte.vue"
import LoginArtist from "@/views/artista/LoginArtista.vue"
import RegisterArtist from "@/views/artista/CadastroArtista.vue"
import MusicCatalog from "@/views/musica/CatalogoMusicas.vue"
import Playlists from "@/views/ouvinte/Playlists.vue"
import PlaylistView from "@/views/ouvinte/PlaylistView.vue"
import AlbumView from "@/views/AlbumView.vue"

import AdminArtistas from "@/views/admin/AdminArtistas.vue"

import ProfilePage from '@/views/ouvinte/Perfil.vue'
import ArtistProfile from '@/views/artista/Perfil.vue'

import AssinaturaView from '@/views/ouvinte/AssinaturaView.vue'

// 👇 Importando as novas telas do Artista
import StreamsView from "@/views/artista/Streams.vue"
import UploadView from "@/views/artista/Upload.vue"

const routes = [
    { path: "/", component: LandingPage },
    { path: "/ouvinte/login", component: LoginOuvinte },
    { path: "/ouvinte/cadastro", component: RegisterListener },
    { path: "/artista/login", component: LoginArtist },
    { path: "/artista/cadastro", component: RegisterArtist },
    { path: "/admin/artistas", component: AdminArtistas }, 
    {
        path: "/", component: MainLayout,
        children: [
            { path: "/musicas", component: MusicCatalog, meta: { requiresAuth: true } },
            { path: "/playlists", component: Playlists, meta: { requiresAuth: true, role: 'users' } },
            { path: "/playlists/:id", component: PlaylistView, meta: { requiresAuth: true } },
            { path: "/albuns/:id", component: AlbumView, meta: { requiresAuth: true } },
            { path: '/assinatura', component: AssinaturaView },
            
            // 👇 Perfis movidos para cá para terem a NavBar!
            { path: '/ouvinte/perfil', name: 'Profile', component: ProfilePage, meta: { requiresAuth: true, role: 'users' } },
            { path: '/artista/perfil', name: 'ArtistProfile', component: ArtistProfile, meta: { requiresAuth: true, role: 'artists' } },

            // 👇 Novas rotas do Artista
            { path: "/artista/streams", component: StreamsView, meta: { requiresAuth: true, role: 'artists' } },
            { path: "/artista/upload", component: UploadView, meta: { requiresAuth: true, role: 'artists' } },
        ]
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to, from) => {
    const authStore = useAuthStore()

    if (authStore.loading) {
        await authStore.checkSession()
    }

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        return '/' // Chuta pra landing page se não tiver logado
    }

    if (to.meta.role && authStore.user?.role !== to.meta.role) {
        return '/' // Chuta pra landing page se a role for errada
    }
})

export default router