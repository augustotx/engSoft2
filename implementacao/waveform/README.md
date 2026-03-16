# Waverform – Frontend

## Como rodar o projeto

Para começar a trabalhar no projeto, siga os passos abaixo:

```bash
git clone https://github.com/augustotx/gestaoDeProjs.git
cd gestaoDeProjs/SpotFEI
git checkout implementacao
npm install
npm run dev
```

Depois disso, o servidor de desenvolvimento iniciará e o projeto poderá ser acessado normalmente no navegador (geralmente em `http://localhost:5173`).

---

# Rotas do projeto

No momento, as páginas são acessadas diretamente pela URL.
Ainda não existe um menu de navegação dentro da aplicação, então para acessar cada página é necessário digitar o caminho manualmente no navegador.

As rotas atuais estão definidas no arquivo:

```
src/router/index.js
```

Configuração atual:

```javascript
const routes = [
  { path: "/", redirect: "/musicas" },
  { path: "/ouvinte/login", component: LoginOuvinte },
  { path: "/ouvinte/cadastro", component: RegisterListener },
  { path: "/artista/login", component: LoginArtist },
  { path: "/artista/cadastro", component: RegisterArtist },
  { path: "/musicas", component: MusicCatalog },
  { path: "/playlists", component: Playlists }
]
```

### Exemplos de acesso

| Página              | URL                 |
| ------------------- | ------------------- |
| Home (redireciona)  | `/`                 |
| Catálogo de músicas | `/musicas`          |
| Login de ouvinte    | `/ouvinte/login`    |
| Cadastro de ouvinte | `/ouvinte/cadastro` |
| Login de artista    | `/artista/login`    |
| Cadastro de artista | `/artista/cadastro` |
| Playlists           | `/playlists`        |

Exemplo:

```
http://localhost:5173/ouvinte/cadastro
```

---

# Estrutura do projeto

A estrutura principal do frontend segue o padrão comum de projetos Vue.

```
src
│
├ assets/        # imagens, ícones e arquivos estáticos
│
├ components/    # componentes reutilizáveis (cards, navbar, etc)
│
├ views/         # páginas principais da aplicação
│   ├ ouvinte/
│   │   ├ LoginOuvinte.vue
│   │   ├ CadastroOuvinte.vue
│   │   └ Playlists.vue
│   │
│   ├ artista/
│   │   ├ LoginArtista.vue
│   │   └ CadastroArtista.vue
│   │
│   └ musica/
│       └ CatalogoMusicas.vue
│
├ router/
│   └ index.js   # configuração das rotas da aplicação
│
├ stores/        # gerenciamento de estado global (Pinia)
│
├ App.vue        # layout principal da aplicação
└ main.js        # inicialização do Vue
```

---

# Como editar o projeto sem quebrar nada

Algumas regras importantes para evitar erros:

### Não deixar arquivos `.vue` vazios

Todo arquivo `.vue` precisa ter pelo menos um `<template>` ou `<script>`.

Exemplo mínimo:

```vue
<template>
  <div>
    <h1>Página em construção</h1>
  </div>
</template>
```

Se um `.vue` estiver vazio, o projeto não compila.

---

### Cada página deve ficar dentro de `views`

As páginas principais da aplicação devem ser colocadas em:

```
src/views/
```

Organizadas por tipo de usuário ou funcionalidade.

Exemplo:

```
views/ouvinte/
views/artista/
views/musica/
```

---

### Sempre registrar novas páginas no router

Se alguém criar uma nova página `.vue`, ela **precisa ser adicionada no `router/index.js`**.

Exemplo:

```javascript
import MinhaPagina from "@/views/MinhaPagina.vue"

{
  path: "/minhapagina",
  component: MinhaPagina
}
```

Se isso não for feito, a página não poderá ser acessada.

---

### O `App.vue` contém o `router-view`

O componente principal do projeto é o `App.vue`, e ele contém:

```vue
<router-view />
```

Isso é o que permite que o Vue troque de página automaticamente quando a rota muda.

---

# Organização para trabalho em grupo

Para evitar conflitos:

* Cada integrante deve trabalhar **na sua própria página**
* Evitar editar arquivos que outra pessoa esteja usando
* Sempre testar o projeto com:

```
npm run dev
```

antes de fazer commit.

---

# Observação

No momento ainda **não existe uma navbar ou menu de navegação**, então todas as páginas precisam ser acessadas manualmente pela URL.

Isso pode ser melhorado posteriormente adicionando um componente de navegação global.
