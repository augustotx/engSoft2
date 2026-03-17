import { createRouter, createWebHistory } from "vue-router"

import LoginOuvinte from "@/views/ouvinte/LoginOuvinte.vue"
import RegisterListener from "@/views/ouvinte/CadastroOuvinte.vue"
import LoginArtist from "@/views/artista/LoginArtista.vue"
import RegisterArtist from "@/views/artista/CadastroArtista.vue"
import MusicCatalog from "@/views/musica/CatalogoMusicas.vue"
import Playlists from "@/views/ouvinte/Playlists.vue"
import CriarPlaylist from "@/views/ouvinte/CriarPlaylist.vue"

const routes = [
  { path: "/", redirect: "/musicas" },
  { path: "/ouvinte/login", component: LoginOuvinte },
  { path: "/ouvinte/cadastro", component: RegisterListener },
  { path: "/artista/login", component: LoginArtist },
  { path: "/artista/cadastro", component: RegisterArtist },
  { path: "/musicas", component: MusicCatalog },
  { path: "/playlists", component: Playlists },
  { path: "/playlists/criar", component: CriarPlaylist }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
