# Waveform

## 1️⃣ Como usar e testar a implementação

### Requisitos
Certifique-se de ter instalado:

- Node.js (versão 18+)
- npm (ou yarn)
- Vue 3
- Bootstrap 5

### Passos para clonar, instalar e rodar
1. Clonar o repositório:
git clone <URL_DO_REPO>
cd Waveform

2. Instalar dependências:
npm install

3. Rodar o servidor de desenvolvimento:
npm run dev

4. Abrir no navegador a URL informada pelo Vite (ex.: http://localhost:5173/)

### Onde colocar os arquivos de áudio
Os arquivos de áudio devem ficar em:
public/audios/
  Schism.mp3
  The_Pot.mp3
  petitjornal300.mp3
  petitjornal254.mp3
  brascubas_cap1.mp3
  metamorfose_cap1.mp3

---

## 2️⃣ Implementação — componentes e interfaces

### Visão geral
O objetivo da atividade foi implementar pelo menos dois componentes e demonstrar que a comunicação entre eles ocorre exclusivamente por meio de interfaces.  

- Componentes: Componente Áudio e Componente Usuário
- Interfaces: AudioPlaybackService e AudioCatalogService

### Componentes

#### Componente Áudio
- Responsável por gerenciar a reprodução de áudios (play/pause, lista, destaque)
- Fornece a interface AudioPlaybackService

#### Componente Usuário
- Responsável por interagir com os áudios (clicar play/pause, ver nome destacado)
- Consome AudioPlaybackService para tocar/pausar
- Fornece AudioCatalogService para fornecer dados ao Componente Áudio

### Interfaces

#### AudioPlaybackService
- play(audioId: number): void
- pause(audioId: number): void
- toggle(audioId: number): void
- getCurrent(): { id: number|null }
- onEnded(callback: (audioId:number) => void): void

#### AudioCatalogService
- list(): AudioItem[]
- getById(id: number): AudioItem | undefined

AudioItem:
- id: number
- nome: string
- duracao: string
- tipo: 'música' | 'podcast' | 'audiobook'
- url: string

### Fluxo de comunicação
1. Usuário obtém a lista de áudios via AudioCatalogService
2. Usuário clica em play/pause
3. Componente Usuário chama AudioPlaybackService para tocar ou pausar
4. Componente Áudio executa a ação internamente
5. Componente Usuário atualiza destaque do nome do áudio ativo

### Arquivos principais
src/views/CatalogView.vue — tela principal
src/components/AudioCatalog.vue — componente do usuário
src/services/AudioService.js — serviço de áudios
public/audios/ — local dos arquivos .mp3

---

## 3️⃣ Funcionalidades implementadas
- Lista de áudios (músicas, podcasts, audiobooks)
- Destaque visual do nome do áudio ativo, permanece azul quando pausado
- Botão play/pause alternando ícones (▶ / ⏸)
- Comunicação entre Áudio e Usuário via interfaces

---

## 4️⃣ Próximos passos
- Implementar reprodução real de áudio via HTML5 Audio
- Adicionar filtros ou categorias no catálogo
- Permitir persistência de histórico ou favoritos

> Este README documenta o projeto Waveform, demonstrando comunicação entre componentes via interfaces.