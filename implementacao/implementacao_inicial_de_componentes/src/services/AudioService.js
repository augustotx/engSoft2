const audios = [
  {
    id: 1,
    nome: "Schism",
    duracao: "6:47",
    tipo: "música",
    url: "/audios/Schism.mp3"
  },
  {
    id: 2,
    nome: "The Pot",
    duracao: "6:22",
    tipo: "música",
    url: "/audios/The_Pot.mp3"
  },

  {
    id: 3,
    nome: "Petit Jornal #300",
    duracao: "42:10",
    tipo: "podcast",
    url: "/audios/petitjornal300.mp3"
  },
  {
    id: 4,
    nome: "Petit Jornal #254",
    duracao: "38:55",
    tipo: "podcast",
    url: "/audios/petitjornal254.mp3"
  },

  {
    id: 5,
    nome: "Memórias Póstumas de Brás Cubas - Capítulo 1",
    duracao: "12:30",
    tipo: "audiobook",
    url: "/audios/brascubas_cap1.mp3"
  },
  {
    id: 6,
    nome: "A Metamorfose - Capítulo 1",
    duracao: "18:05",
    tipo: "audiobook",
    url: "/audios/metamorfose_cap1.mp3"
  }
]

export function listarAudios() {
  return audios
}

export function buscarAudio(id) {
  return audios.find(a => a.id === id)
}

export function tocarAudio(audio) {
  const player = new Audio(audio.url)
  player.play()
}