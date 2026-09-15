# Javascript Small 2D Game Engine

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
- Jogos Breakout, Pacman, Snake, Racing e Car
- Jogo de demonstração de sprites com animação e inversão horizontal
- Seleção do jogo ativo por factory em `main.js`
- Sistema de input centralizado na classe `Game`
- Reinicialização do jogo com a tecla `F12`
- Pausa e retomada do jogo com a tecla `P`
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
│   ├── pacman.js
│   ├── racing.js
│   ├── snake.js
│   ├── game-rendering.js
│   ├── game-loop.js
│   ├── game.js
│   ├── sprite.js
│   ├── tree-game.js
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
2. Pressione a tecla `Enter` para iniciar o jogo selecionado.

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

- `main.js` seleciona uma factory por índice e cria somente o jogo escolhido, disparando a partida com Enter.
- `game.js` é a classe base: configura o ciclo de vida, o loop, o canvas, os buffers e o input do teclado.
- `breakout-game.js`, `pacman.js`, `snake.js`, `racing.js`, `car-game.js` e `double-dragon-game.js` implementam jogos derivados da classe base.
- `game-rendering.js` fornece a infraestrutura de canvas, janela e buffering para a classe base.
- `game-loop.js` executa o loop principal em dois modos (`setTimeout` com limite de `renderFPS` ou `requestAnimationFrame`), atualiza a simulação com passo fixo definido por `updateFPS` e envia a interpolação para a renderização.
- `sprite.js` fornece spritesheet, animações nomeadas e inversão horizontal/vertical para reutilizar a mesma imagem.
- `sound.js` gerencia a reprodução de áudio.
- `constants.js` define os modos de tela e buffering.

### Sprites e animações

`Sprite` recebe uma imagem com os quadros organizados horizontalmente e o tamanho de cada quadro. Cada animação informa um identificador, o primeiro quadro, a quantidade de quadros e a duração de cada quadro:

```javascript
import { INVERTED_X, Sprite } from './sprite.js';

const tile = new Image();
tile.src = './resources/player.png';

const playerSprite = new Sprite(tile, 32, 48);
playerSprite.addAnimation('idle', 0, 4, 0.12);
playerSprite.addAnimation('run', 4, 6, 0.08);
playerSprite.playAnimation('run');

// Chame no update fixo e no render do jogo, respectivamente.
playerSprite.update(deltaTime);
playerSprite.draw(context, player.x, player.y, { [INVERTED_X]: player.facing < 0 });
```

As animações repetem por padrão. Para uma animação que deve parar no último quadro, passe `false` como quinto argumento de `addAnimation`. As flags `INVERTED_X` e `INVERTED_Y` são opcionais e têm valor padrão `false`; também é possível definir o estado padrão com `setInverted()`.

O zoom fixo pode ser definido com `setZoom()` e é aplicado a partir do centro do sprite:

```javascript
playerSprite.setZoom(2);
```

Uma animação também pode controlar o zoom. O sexto argumento de `addAnimation()` aceita `minimum`, `maximum`, `duration` e o modo `loop` ou `ping-pong`:

```javascript
playerSprite.addAnimation('hit', 10, 3, 0.08, true, {
    zoom: { minimum: 1, maximum: 1.4, duration: 0.3, mode: 'ping-pong' },
    affectsCollision: false
});
```

O zoom não altera a colisão por padrão. Use `AFFECTS_COLLISION` na animação ou em `setZoom()` para habilitá-la e consulte os limites com `getCollisionBounds(x, y)`. `getBounds(x, y)` sempre retorna os limites visuais atuais.

### Seleção do jogo

As factories dos jogos são registradas no `main.js` usando estas posições:

```javascript
const BREAKOUT = 0;
const PACMAN = 1;
const SNAKE = 2;
const RACING = 3;
const CAR = 4;
const DOUBLE_DRAGON = 5;
```

Para escolher o jogo executado, altere a seleção no mesmo arquivo. Apenas a factory selecionada será executada:

```javascript
const createGame = gameFactories[SNAKE];
const game = createGame();
```

O beat'em up de uma fase usa as setas para movimento, `A` para soco, `B` para chute e `C` para pulo. `J`, `K` e `L` também funcionam como os comandos de ação do mapa retro padrão.

### Frequências do loop

As frequências da simulação e da renderização são independentes:

```javascript
const config = {
    updateFPS: 60,
    renderFPS: 0,
    maxUpdatesPerFrame: 5
};
```

- `updateFPS` define o passo fixo da simulação.
- `renderFPS` limita a renderização; `0` usa `requestAnimationFrame`.
- `maxUpdatesPerFrame` limita quantos updates podem ser processados por renderização. O padrão é `5`; atrasos excedentes são descartados para evitar acúmulo infinito.

### Controles

O mapa padrão de teclas é definido em `Game`:

| Ação | Tecla |
| --- | --- |
| UP | `ArrowUp` |
| DOWN | `ArrowDown` |
| LEFT | `ArrowLeft` |
| RIGHT | `ArrowRight` |
| A | `j` |
| B | `k` |
| C | `l` |
| START | `Enter` |
| SELECT | `Backspace` |
| RESET | `F12` |
| PAUSE | `p` |

Os jogos podem sobrescrever `processInput()` e consultar `isKeyPressed()` ou `wasKeyPressed()` conforme a necessidade. A classe `Game` também fornece `start()`, `stop()`, `pause()`, `resume()`, `reset()` e `destroy()` para controlar o ciclo de vida. `reset()` interrompe o loop, restaura o estado inicial do jogo e deixa a tela pronta para um novo `START`. A tecla `P` alterna entre pausa e retomada.

## Observações

- O projeto é uma base educativa e experimental.
- O motor é simples e foi pensado para ajudar no aprendizado de arquitetura de jogos em JavaScript.
- A música é carregada a partir de `resources/1.mp3`, então o projeto deve ser servido a partir da raiz do diretório para que o caminho funcione corretamente.

## Futuras melhorias

- criar objetos e sprites reutilizáveis
- implementar colisão
- criar sistema de fases e UI
- adicionar suporte a múltiplos canais de som

## Licença

Este projeto está disponível para fins educacionais e de aprendizado.
