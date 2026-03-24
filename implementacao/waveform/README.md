# Waveform – Frontend

## Como rodar o projeto

Para começar a trabalhar no projeto, siga os passos abaixo:

```bash
git clone https://github.com/augustotx/gestaoDeProjs.git
cd gestaoDeProjs
git checkout implementacao
cd waveformMain/implementacao/waveform
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

---

# Para desenvolvedores(as):

## Submódulo do frontend

O projeto é um submódulo dentro do [repositório de gestão](https://github.com/augustotx/gestaoDeProjs), então para clonar o repositório completo com o frontend, use:

```bash
# obviamente sem as aspas e as setas
git clone "<repositório principal>"

cd gestaoDeProjs/

# isso vai clonar o frontend dentro da pasta waveformMain
git submodule update --init --recursive
```

Qualquer commit dentro desse submódulo deve ser feito dentro da pasta dele. Depois, para atualizar o repositório principal, é necessário fazer um commit do submódulo atualizado.

```bash
# vamos supor que você fez um commit dentro do waveformMain
git commit -m "commit do front"
git push

# depois disso, é necessário atualizar o repositório principal para apontar para o novo commit do submódulo
cd .. # ou qualquer lugar que esteja o repositório principal
git add . # add tudo

git commit -m "atualizando submódulo do front"
git push origin implementacao # (por exemplo)
```

## PostgreSQL

Ele roda em um container Docker, então para iniciar o banco de dados, use:

```bash
docker compose up -d
```

Ele vai criar o container com o PostgreSQL já configurado, aí pra usar ele junto do front é só rodar o backend:

```bash
cd backend
npm install # caso ainda não tenha instalado as dependências
node index.js
```

Pegar o Arquivo .env.example e criar uma copia chamada apenas .env (Esta deve ficar apenas local)
Nos Arquivo .env colocar as informações do google client id que estão no whatts. Não dar commit nesses ID por que são informações sensiveis.
Um Arquivo .env esta no implementacao/waveform/backend
O outro no implementacao/waveform


Ele usa a porta 3000, então o frontend pode acessar a API normalmente em `http://localhost:3000`.

Qualquer adição de dados no banco, por favor fazer isso via arquivos .sql dentro da pasta `sql` do backend, para manter a organização. Esses arquivos podem ser rodados da seguinte forma:

```bash
docker cp <arquivo.sql> postgres-custom:<arquivo.sql>
docker exec -it postgres-custom psql -U fei -d maindb -f /<arquivo.sql>
```

Rodar:
docker cp backend/sql/create_users.sql postgres-custom:create_users.sql
docker exec -it postgres-custom psql -U fei -d maindb -f /create_users.sql

Eu (Augusto) deixei o init.sql na raiz do projeto, então ele já é rodado automaticamente quando o container é criado, mas para adicionar mais dados depois disso, é necessário seguir os passos acima. Eu deixei um exemplo de arquivo de inserção de dados dentro da pasta `sql` do backend, para servir como modelo (adiciona um artista, um álbum e nove músicas).

### Scripts nas pasta backend para adicionar novos artistas, albuns e músicas na DB:

#### Artista
Cria o artista no banco para gerar um ID.

```bash
node AddArtista.js "Nome do Artista"
```
### Album
Cria o álbum vinculado a um Artista. Você precisa do ID do artista gerado no passo anterior.
```bash
node AddAlbum.js <ID_ARTISTA> "caminho/da/capa.jpg" "Nome do Album"
```

### Música
Adiciona a faixa ao álbum. Requer ID do Álbum e ID do Artista. 
```bash
node AddMusica.js <ID_ALBUM> <ID_ARTISTA> <NUMERO_FAIXA> "caminho/do/arquivo.mp3" "Titulo da Musica"
```

### Usuario
Adiciona um usuario a DB, aqui tem um exemplo pronto, para ser usado em testes.
```bash
node AddUser.js <GOOGLE_ID> <EMAIL> <USERNAME> <ROLE> "NOME COMPLETO"
node AddUser.js 1111111111 meuemail@gmail.com dev123 listener Joao da Silva
```

## Sobre a Criação de Playlists

Como não ainda não estamos salvando o estado do usuário (quem é que está logado) as playlists criadas são sempre vinculadas ao usuário de id 1
Então se forem criar uma playlist, lembrem de criar um usuário antes!



