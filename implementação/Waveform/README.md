# Waveform

## 1 Como usar e testar a implementação

### Requisitos
Certifique-se de ter instalado:

- Node.js (versão 18+)
- npm (ou yarn)
- Vue 3
- Bootstrap 5

### Passos para clonar, instalar e rodar
1. Clonar o repositório:
git clone https://github.com/augustotx/engSoft2.git 

2. Mudar para o diretório correto:
cd implementação/Waveform

3. Instalar dependências:
npm install

4. Rodar o servidor de desenvolvimento:
npm run dev

5. Abrir no navegador a URL informada pelo Vite (ex.: http://localhost:5173/)

---

## 2 Implementação — componentes e interfaces

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
- TocarAudio(audioId)

#### AudioCatalogService
- listarAudioUser(UserId)

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

---

## 3️⃣ Funcionalidades implementadas
- Lista de áudios (músicas, podcasts, audiobooks)
- Destaque visual do nome do áudio ativo, permanece destacado quando pausado
- Botão play/pause alternando ícones (▶ / ⏸)
- Comunicação entre Áudio e Usuário via interfaces
