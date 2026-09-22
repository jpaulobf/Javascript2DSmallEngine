import { Camera } from './camera.js';
import { Game } from './game.js';
import { Rect } from './rect.js';
import { Scene } from './scene.js';
import { UiText } from './ui-text.js';

export class DoubleDragonGame extends Game {

    init() {
        this.worldWidth = 2400;
        this.groundY = 470;
        this.playerWidth = 34;
        this.playerHeight = 64;
        this.playerSpeed = 260;
        this.jumpSpeed = 560;
        this.gravity = 1450;
        this.attackDuration = 0.24;
        this.attackCooldown = 0.08;
        this.enemyWidth = 34;
        this.enemyHeight = 60;
        this.scene = new Scene();
        this.camera = new Camera(this.width, this.height, this.worldWidth, this.height);
        this.resetGame();
    }

    resetGame() {
        this.score = 0;
        this.camera.moveTo(0, 0);
        this.messageTimer = 0;
        this.player = this.createFighter(120, this.groundY - 52, '#38bdf8');
        this.player.health = 5;
        this.player.facing = 1;
        this.player.z = 0;
        this.player.verticalVelocity = 0;
        this.player.attack = null;
        this.player.attackCooldown = 0;
        this.player.invulnerable = 0;
        this.enemies = [
            this.createEnemy(520, 430, '#ef4444'),
            this.createEnemy(720, 500, '#f97316'),
            this.createEnemy(980, 400, '#ef4444'),
            this.createEnemy(1260, 455, '#f97316'),
            this.createEnemy(1530, 390, '#ef4444'),
            this.createEnemy(1810, 475, '#f97316'),
            this.createEnemy(2100, 420, '#ef4444')
        ];
        this.scene.set('ready');
    }

    createFighter(x, y, color) {
        return {
            x,
            y,
            previousX: x,
            previousY: y,
            width: this.enemyWidth,
            height: this.enemyHeight,
            color,
            facing: -1,
            z: 0,
            verticalVelocity: 0,
            health: 2,
            stun: 0,
            attackCooldown: 0,
            hitFlash: 0,
            dead: false
        };
    }

    createEnemy(x, y, color) {
        const enemy = this.createFighter(x, y, color);
        enemy.facing = -1;
        return enemy;
    }

    setKeyState(key, isPressed, event) {
        const normalizedKey = key.length === 1 ? key.toLowerCase() : key;
        const actionAliases = { b: 'B', c: 'C' };
        const action = actionAliases[normalizedKey];
        if (!action) {
            super.setKeyState(key, isPressed, event);
            return;
        }

        this.keyStates.set(action, isPressed);
        event?.preventDefault();
    }

    processInput() {
        super.processInput();
        this.inputX = (this.isKeyPressed('RIGHT') ? 1 : 0) - (this.isKeyPressed('LEFT') ? 1 : 0);
        this.inputY = (this.isKeyPressed('DOWN') ? 1 : 0) - (this.isKeyPressed('UP') ? 1 : 0);

        if (!this.scene.is('playing') || this.player.attack || this.player.z > 0) return;
        if (this.wasKeyPressed('A')) this.beginAttack('punch');
        else if (this.wasKeyPressed('B')) this.beginAttack('kick');
        else if (this.wasKeyPressed('C')) this.jump();
    }

    start() {
        if (this.scene.is('won', 'gameover')) this.resetGame();
        this.scene.set('playing');
        super.start();
    }

    update(deltaTime) {
        if (!this.started || !this.scene.is('playing')) return;

        this.updatePlayer(deltaTime);
        this.updateEnemies(deltaTime);
        this.resolveCombat();
        this.updateCamera(deltaTime);

        if (this.enemies.every((enemy) => enemy.dead)) {
            this.scene.set('won');
            this.messageTimer = 0;
        }
    }

    updatePlayer(deltaTime) {
        const player = this.player;
        player.previousX = player.x;
        player.previousY = player.y;
        player.attackCooldown = Math.max(0, player.attackCooldown - deltaTime);
        player.invulnerable = Math.max(0, player.invulnerable - deltaTime);

        if (player.attack) {
            player.attack.timer -= deltaTime;
            if (player.attack.timer <= 0) player.attack = null;
        } else if (player.stun <= 0) {
            player.x += this.inputX * this.playerSpeed * deltaTime;
            player.y += this.inputY * this.playerSpeed * 0.55 * deltaTime;
            if (this.inputX !== 0) player.facing = this.inputX;
        }

        player.stun = Math.max(0, player.stun - deltaTime);
        this.updateJump(player, deltaTime);
        this.constrainFighter(player);
    }

    updateJump(fighter, deltaTime) {
        if (fighter.z <= 0 && fighter.verticalVelocity <= 0) return;

        fighter.z += fighter.verticalVelocity * deltaTime;
        fighter.verticalVelocity -= this.gravity * deltaTime;
        if (fighter.z <= 0) {
            fighter.z = 0;
            fighter.verticalVelocity = 0;
        }
    }

    updateEnemies(deltaTime) {
        for (const enemy of this.enemies) {
            if (enemy.dead) continue;

            enemy.previousX = enemy.x;
            enemy.previousY = enemy.y;
            enemy.attackCooldown = Math.max(0, enemy.attackCooldown - deltaTime);
            enemy.hitFlash = Math.max(0, enemy.hitFlash - deltaTime);
            enemy.stun = Math.max(0, enemy.stun - deltaTime);
            if (enemy.stun > 0) continue;

            const distanceX = this.player.x - enemy.x;
            const distanceY = this.player.y - enemy.y;
            const closeEnough = Math.abs(distanceX) < 54 && Math.abs(distanceY) < 28;
            if (closeEnough) {
                if (enemy.attackCooldown <= 0) {
                    this.hurtPlayer(enemy);
                    enemy.attackCooldown = 0.8 + Math.random() * 0.3;
                }
                continue;
            }

            if (Math.abs(distanceX) > 38) {
                const direction = Math.sign(distanceX);
                enemy.x += direction * 90 * deltaTime;
                enemy.facing = direction;
            }
            if (Math.abs(distanceY) > 12) enemy.y += Math.sign(distanceY) * 65 * deltaTime;
            this.constrainFighter(enemy);
        }
    }

    beginAttack(type) {
        if (this.player.attackCooldown > 0) return;
        this.player.attack = {
            type,
            timer: this.attackDuration,
            hit: false
        };
        this.player.attackCooldown = this.attackCooldown;
    }

    jump() {
        if (this.player.z > 0) return;
        this.player.verticalVelocity = this.jumpSpeed;
    }

    resolveCombat() {
        const attack = this.player.attack;
        if (!attack || attack.hit) return;

        const reach = attack.type === 'kick' ? 68 : 54;
        const attackBox = new Rect(
            this.player.facing > 0 ? this.player.x + this.player.width / 2 : this.player.x - reach,
            this.player.y - 20, reach, 40);
        const hitEnemy = this.enemies.find((enemy) => !enemy.dead &&
            Rect.overlaps(attackBox, this.getFighterBox(enemy)) && Math.abs(this.player.z) < 18);

        if (!hitEnemy) return;
        attack.hit = true;
        hitEnemy.health--;
        hitEnemy.hitFlash = 0.12;
        hitEnemy.stun = 0.24;
        hitEnemy.x += this.player.facing * 22;
        this.score += attack.type === 'kick' ? 150 : 100;
        if (hitEnemy.health <= 0) {
            hitEnemy.dead = true;
            this.score += 250;
        }
    }

    hurtPlayer(enemy) {
        if (this.player.invulnerable > 0 || this.player.z > 12) return;
        this.player.health--;
        this.player.invulnerable = 0.8;
        this.player.stun = 0.28;
        this.player.x += Math.sign(this.player.x - enemy.x || 1) * 30;
        if (this.player.health <= 0) this.scene.set('gameover');
    }

    getFighterBox(fighter) {
        return new Rect(fighter.x, fighter.y - fighter.height + 12,
            fighter.width, fighter.height - 12);
    }

    constrainFighter(fighter) {
        fighter.x = Math.max(24, Math.min(this.worldWidth - fighter.width - 24, fighter.x));
        fighter.y = Math.max(350, Math.min(this.groundY - 18, fighter.y));
    }

    updateCamera(deltaTime) {
        this.camera.follow(this.player.x, 0, 0.35, 0, Math.min(1, deltaTime * 6));
    }

    render(context, canvas, interpolation) {
        this.renderBackground(context, canvas);
        this.renderStage(context, canvas);
        this.renderEnemies(context, interpolation);
        this.renderPlayer(context, interpolation);
        this.renderHud(context, canvas);
        if (!this.scene.is('playing')) this.renderOverlay(context, canvas);
    }

    renderBackground(context, canvas) {
        context.fillStyle = '#101827';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#1b2c46';
        context.fillRect(0, 0, canvas.width, 330);
        context.fillStyle = '#233d5d';
        for (let x = -80 - (this.camera.x * 0.18) % 260; x < canvas.width + 260; x += 260) {
            context.fillRect(x, 100, 170, 230);
            context.fillStyle = '#f8d37a';
            for (let windowY = 125; windowY < 290; windowY += 42) {
                context.fillRect(x + 22, windowY, 14, 10);
                context.fillRect(x + 72, windowY, 14, 10);
                context.fillRect(x + 122, windowY, 14, 10);
            }
            context.fillStyle = '#233d5d';
        }
        context.fillStyle = '#162235';
        context.fillRect(0, 330, canvas.width, 270);
    }

    renderStage(context, canvas) {
        const groundTop = 500;
        context.fillStyle = '#374151';
        context.fillRect(0, groundTop, canvas.width, canvas.height - groundTop);
        context.fillStyle = '#4b5563';
        for (let x = -this.camera.x % 80; x < canvas.width; x += 80) context.fillRect(x, groundTop, 40, 5);
        context.fillStyle = '#111827';
        context.fillRect(0, this.groundY + 34, canvas.width, 4);
        context.save();
        context.translate(-this.camera.x, 0);
        context.fillStyle = '#facc15';
        context.fillRect(0, 346, this.worldWidth, 4);
        for (let x = 0; x < this.worldWidth; x += 300) {
            context.fillStyle = '#c2410c';
            context.fillRect(x + 34, 365, 120, 18);
            context.fillStyle = '#fed7aa';
            context.font = '12px Arial';
            context.fillText('FIGHT ZONE', x + 48, 378);
        }
        context.restore();
    }

    renderEnemies(context, interpolation) {
        for (const enemy of this.enemies) {
            if (enemy.dead) continue;
            const x = this.camera.toScreenX(this.interpolate(enemy.previousX, enemy.x, interpolation));
            const y = this.interpolate(enemy.previousY, enemy.y, interpolation);
            this.renderShadow(context, x + enemy.width / 2, y + 8);
            context.fillStyle = enemy.hitFlash > 0 ? '#fef08a' : enemy.color;
            context.fillRect(x, y - enemy.height - enemy.z, enemy.width, enemy.height);
            context.fillStyle = '#111827';
            context.fillRect(x + (enemy.facing > 0 ? 23 : 5), y - enemy.height + 16 - enemy.z, 6, 6);
            context.fillStyle = '#7f1d1d';
            context.fillRect(x + 5, y - enemy.height - 10 - enemy.z, Math.max(0, 24 * enemy.health / 2), 4);
        }
    }

    renderPlayer(context, interpolation) {
        const player = this.player;
        const x = this.camera.toScreenX(this.interpolate(player.previousX, player.x, interpolation));
        const y = this.interpolate(player.previousY, player.y, interpolation);
        this.renderShadow(context, x + player.width / 2, y + 8);
        context.globalAlpha = player.invulnerable > 0 && Math.floor(player.invulnerable * 18) % 2 === 0 ? 0.42 : 1;
        context.fillStyle = '#38bdf8';
        context.fillRect(x, y - player.height - player.z, player.width, player.height);
        context.fillStyle = '#e0f2fe';
        context.fillRect(x + (player.facing > 0 ? 23 : 5), y - player.height + 16 - player.z, 6, 6);
        if (player.attack) this.renderAttack(context, player, x, y);
        context.globalAlpha = 1;
    }

    renderAttack(context, player, x, y) {
        const isKick = player.attack.type === 'kick';
        const reach = isKick ? 68 : 54;
        const attackX = player.facing > 0 ? x + player.width : x - reach;
        const attackY = y - (isKick ? 32 : 49) - player.z;
        context.fillStyle = isKick ? '#fb923c' : '#f8fafc';
        context.fillRect(attackX, attackY, reach, isKick ? 18 : 14);
        context.fillStyle = '#facc15';
        context.fillRect(player.facing > 0 ? attackX + reach - 8 : attackX, attackY - 4, 8, isKick ? 26 : 22);
    }

    renderShadow(context, x, y) {
        context.fillStyle = 'rgba(0, 0, 0, 0.35)';
        context.fillRect(x - 21, y, 42, 8);
    }

    renderHud(context, canvas) {
        UiText.draw(context, `SCORE ${this.score}`, 20, 30, { color: '#f8fafc', font: '18px Arial' });
        UiText.draw(context, 'HP', 20, 58, { color: '#f8fafc', font: '18px Arial' });
        for (let index = 0; index < 5; index++) {
            context.fillStyle = index < this.player.health ? '#ef4444' : '#4b5563';
            context.fillRect(52 + index * 20, 44, 14, 14);
        }
        UiText.draw(context, `${this.fps} FPS`, canvas.width - 20, 30,
            { color: '#cbd5e1', font: '18px Arial', align: 'right' });
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(8, 15, 29, 0.78)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        const textOptions = { color: '#f8fafc', font: '36px Arial', align: 'center', baseline: 'middle' };
        if (this.scene.is('ready')) {
            UiText.draw(context, 'PRESS ENTER TO START', canvas.width / 2, canvas.height / 2 - 28, textOptions);
            UiText.draw(context, 'ARROWS MOVE   A PUNCH   B KICK   C JUMP', canvas.width / 2,
                canvas.height / 2 + 24, { ...textOptions, color: '#bae6fd', font: '18px Arial' });
        }
        if (this.scene.is('won')) UiText.draw(context, 'STREET CLEARED', canvas.width / 2, canvas.height / 2, textOptions);
        if (this.scene.is('gameover')) {
            UiText.draw(context, 'GAME OVER - PRESS ENTER', canvas.width / 2, canvas.height / 2, textOptions);
        }
    }

    interpolate(previous, current, interpolation) {
        return previous + (current - previous) * interpolation;
    }
}
