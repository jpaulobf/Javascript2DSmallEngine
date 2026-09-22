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
- Jogos Breakout, Pacman, Snake, Racing, Car e Mario Demo
- Jogo de demonstração de sprites com animação e inversão horizontal
- Seleção do jogo ativo por factory em `main.js`
- Sistema de input centralizado na classe `Game`
- Reinicialização do jogo com a tecla `F12`
- Pausa e retomada do jogo com a tecla `P`
- Música de fundo com suporte a loop
- Tela inicial com instrução para iniciar ao pressionar Enter

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
- `camera.js` mantém a posição da câmera limitada ao mundo e converte coordenadas de mundo para tela.
- `rect.js` concentra a verificação de sobreposição AABB entre retângulos.
- `scene.js` armazena o estado atual do jogo, como `ready`, `playing` e `gameover`.
- `ui-text.js` desenha texto de interface sem deixar estilos de texto persistirem no contexto do canvas.
- `sprite.js` fornece spritesheet, animações nomeadas e inversão horizontal/vertical para reutilizar a mesma imagem.
- `sound.js` gerencia a reprodução de áudio.
- `constants.js` define os modos de tela e buffering.

### Sprites e animações

`Sprite` recebe o caminho da imagem com os quadros organizados horizontalmente e o tamanho de cada quadro. Cada animação é configurada como objeto:

```javascript
import { INVERTED_X, Sprite } from './sprite.js';

const playerSprite = new Sprite('./resources/player.png', 32, 48);
playerSprite.addAnimation({
    id: 'idle',
    startFrame: 0,
    frameCount: 4,
    frameDuration: 0.12,
    loop: true
});
playerSprite.addAnimation({
    id: 'run',
    startFrame: 4,
    frameCount: 6,
    frameDuration: 0.08,
    loop: true
});
playerSprite.playAnimation('run');

// Chame no update fixo e no render do jogo, respectivamente.
playerSprite.update(deltaTime);
playerSprite.draw(context, player.x, player.y, { [INVERTED_X]: player.facing < 0 });
```

As animações repetem por padrão. Para uma animação que deve parar no último quadro, use `loop: false`. As flags `INVERTED_X` e `INVERTED_Y` são opcionais e têm valor padrão `false`; também é possível definir o estado padrão com `setInverted()`.

Por padrão, as posições informadas para `draw()`, `getBounds()` e colisão representam o canto superior esquerdo do sprite. Use `setAnchor(x, y)` para escolher outro ponto de origem, com valores normalizados entre `0` e `1`. Por exemplo, `(0.5, 1)` fixa a posição no centro da base:

```javascript
playerSprite.setAnchor(0.5, 1);
playerSprite.draw(context, player.x, player.y);
```

O anchor também é usado como pivô de rotação e permanece fixo durante o zoom.

O zoom fixo pode ser definido com `setZoom()` e é aplicado a partir do anchor do sprite:

```javascript
playerSprite.setZoom(2);
```

Uma animação também pode controlar o zoom. A configuração aceita `minimum`, `maximum`, `duration` e o modo `loop` ou `ping-pong`:

```javascript
playerSprite.addAnimation({
    id: 'hit',
    startFrame: 10,
    frameCount: 3,
    frameDuration: 0.08,
    loop: true,
    zoom: { minimum: 1, maximum: 1.4, duration: 0.3, mode: 'ping-pong' },
    affectsCollision: false
});
```

O zoom não altera a colisão por padrão. Use `AFFECTS_COLLISION` na animação ou em `setZoom()` para habilitá-la e consulte os limites com `getCollisionBounds(x, y)`. `getBounds(x, y)` sempre retorna os limites visuais atuais.

Para testar a colisão AABB entre dois sprites, informe as posições correspondentes ao anchor configurado:

```javascript
if (playerSprite.collidesWith(enemySprite, player.x, player.y, enemy.x, enemy.y)) {
    // Os retângulos dos sprites estão sobrepostos.
}
```

Uma animação também pode girar o sprite. `clockwise` define o sentido e `speed` varia de `0` a `360`. A velocidade é calculada como `speed / 100` graus por update: `100` mantém a velocidade original de `1` grau e `360` gira `3,6` graus por update.

```javascript
playerSprite.addAnimation({
    id: 'spin',
    startFrame: 0,
    frameCount: 4,
    frameDuration: 0.08,
    loop: true,
    rotation: { clockwise: true, speed: 100 }
});
```

### TileSet e TileMap

`TileSet` representa uma spritesheet organizada em grade. `TileMap` armazena os indices dos tiles e desenha somente a parte visivel da matriz:

```javascript
import { TileSet } from './code/tile-set.js';
import { TileMap } from './code/tile-map.js';

const tileSet = new TileSet('./resources/terrain.png', 16, 16, 8);
const background = new TileMap(tileSet, [
    [0, 0, 0, 0, 0],
    [1, 1, 1, 1, 1],
    [2, 2, 2, 2, 2]
]);

background.draw(context, camera.x, camera.y, canvas.width, canvas.height);
background.setTile(2, 1, 3);
```

Use `null` ou um indice negativo para deixar uma celula vazia. O quarto argumento de `TileSet` informa quantas colunas existem na spritesheet.

### Seleção do jogo

As factories dos jogos são registradas no `main.js` usando estas posições:

```javascript
const BREAKOUT = 0;
const PACMAN = 1;
const SNAKE = 2;
const RACING = 3;
const CAR = 4;
const DOUBLE_DRAGON = 5;
const TREE = 6;
const MARIO_DEMO = 7;
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
