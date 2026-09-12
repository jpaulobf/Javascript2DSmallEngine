# Javascript2DSmallEngine

Um pequeno motor/game loop em JavaScript para criação de jogos 2D em canvas, com suporte a renderização em buffer duplo, controle de FPS, fullscreen e reprodução de música.

## Visão geral

Este projeto é uma base simples para entender como um loop principal de jogo funciona em navegador, utilizando HTML5 Canvas e JavaScript modular. Ele mostra conceitos fundamentais como:

- criação e atualização de um jogo em loop
- renderização em canvas
- controle de FPS
- execução com buffer duplo
- suporte a janela em tela cheia
- reprodução de áudio em loop

## Funcionalidades

- Canvas 2D para renderização
- Game loop com controle de tempo e FPS
- Modo de buffering: sem buffer, buffer duplo e buffer triplo
- Modo de janela: normal, fullscreen e janela em fullscreen
- Jogo Breakout com raquete, bola, blocos, pontuação e vidas
- Música de fundo com suporte a loop
- Tela inicial com instrução para iniciar ao pressionar Enter

## Estrutura do projeto

```text
.
├── index.html
├── README.md
├── code/
│   ├── constants.js
│   ├── car-game.js
│   ├── breakout-game.js
│   ├── game-rendering.js
│   ├── game-loop.js
│   ├── game.js
│   ├── main.js
│   └── sound.js
└── resources/
    └── 1.mp3
```

## Requisitos

- Navegador moderno com suporte a JavaScript ES modules
- Arquivo de áudio localizado em `resources/1.mp3`

## Como executar

### Opção 1: abrir diretamente no navegador

1. Abra o arquivo `index.html` no navegador.
2. Pressione a tecla `Enter` para iniciar a simulação.

> Pode funcionar em alguns navegadores, mas a execução via servidor local é mais confiável.

### Opção 2: usando um servidor local

No terminal, na pasta do projeto, execute:

```bash
python -m http.server 8000
```

Depois acesse:

```text
http://localhost:8000
```

## Como funciona

- `main.js` configura o Breakout, inicializa-o e dispara a partida com Enter.
- `game.js` é a classe base: configura o ciclo de vida, o loop, o canvas e os buffers.
- `breakout-game.js` implementa o jogo com `init`, `update` e `render`.
- `car-game.js` permanece como um exemplo alternativo de classe filha.
- `game-rendering.js` fornece a infraestrutura de canvas, janela e buffering para a classe base.
- `game-loop.js` executa o loop principal, atualiza o jogo e limita o FPS.
- `sound.js` gerencia a reprodução de áudio.
- `constants.js` define os modos de tela e buffering.

## Observações

- O projeto é uma base educativa e experimental.
- O motor é simples e foi pensado para ajudar no aprendizado de arquitetura de jogos em JavaScript.
- A música é carregada a partir de `resources/1.mp3`, então o projeto deve ser servido a partir da raiz do diretório para que o caminho funcione corretamente.

## Futuras melhorias

- adicionar entrada do teclado e mouse
- criar objetos e sprites reutilizáveis
- implementar colisão
- criar sistema de fases e UI
- adicionar suporte a múltiplos canais de som

## Licença

Este projeto está disponível para fins educacionais e de aprendizado.
