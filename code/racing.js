import { Game } from './game.js';

export class RacingGame extends Game {

    init() {
        this.roadWidth = 900;
        this.trackLength = 12000;
        this.playerWidth = 54;
        this.playerHeight = 86;
        this.maxSpeed = 650;
        this.acceleration = 360;
        this.braking = 700;
        this.offRoadDrag = 260;
        this.steeringSpeed = 1.7;
        this.segmentLength = 120;
        this.viewDistance = 2400;
        this.status = 'ready';

        this.resetGame();
    }

    start() {
        if (this.status === 'finished') this.resetGame();
        this.status = 'playing';
        super.start();
    }

    resetGame() {
        this.speed = 0;
        this.distance = 0;
        this.previousDistance = this.distance;
        this.playerX = 0;
        this.previousPlayerX = this.playerX;
        this.elapsedTime = 0;
        this.status = 'ready';
        this.createTraffic();
    }

    createTraffic() {
        this.traffic = [
            { distance: 1500, x: -0.55, targetX: -0.55, speed: 280, desiredSpeed: 300, color: '#f97316' },
            { distance: 2900, x: 0.45, targetX: 0.45, speed: 330, desiredSpeed: 360, color: '#38bdf8' },
            { distance: 4700, x: -0.18, targetX: -0.18, speed: 390, desiredSpeed: 400, color: '#facc15' },
            { distance: 6500, x: 0.62, targetX: 0.62, speed: 310, desiredSpeed: 340, color: '#a78bfa' },
            { distance: 8200, x: -0.65, targetX: -0.65, speed: 360, desiredSpeed: 370, color: '#fb7185' }
        ];
        for (const car of this.traffic) {
            car.previousDistance = car.distance;
            car.previousX = car.x;
        }
    }

    processInput() {
        super.processInput();
        this.inputDirection = (this.isKeyPressed('RIGHT') ? 1 : 0) - (this.isKeyPressed('LEFT') ? 1 : 0);
    }

    update(deltaTime) {
        if (!this.started || this.status !== 'playing') return;

        this.previousDistance = this.distance;
        this.previousPlayerX = this.playerX;
        const isBraking = this.isKeyPressed('DOWN');
        const isAccelerating = this.isKeyPressed('UP');
        const targetSpeed = isBraking ? 100 : this.maxSpeed;
        if (isAccelerating || isBraking) {
            const rate = isBraking ? this.braking : this.acceleration;
            this.speed += Math.sign(targetSpeed - this.speed) * rate * deltaTime;
        } else {
            this.speed = Math.max(0, this.speed - this.acceleration * 0.35 * deltaTime);
        }

        this.speed = Math.max(0, Math.min(this.maxSpeed, this.speed));
        this.playerX += this.inputDirection * this.steeringSpeed * deltaTime * (0.35 + this.speed / this.maxSpeed);
        this.playerX = Math.max(-1.12, Math.min(1.12, this.playerX));

        if (Math.abs(this.playerX) > 0.92) this.speed = Math.max(0, this.speed - this.offRoadDrag * deltaTime);

        this.distance += this.speed * deltaTime;
        this.elapsedTime += deltaTime;
        this.updateTraffic(deltaTime);

        if (this.distance >= this.trackLength) {
            this.distance = this.trackLength;
            this.status = 'finished';
        }
    }

    updateTraffic(deltaTime) {
        for (const car of this.traffic) {
            car.previousDistance = car.distance;
            car.previousX = car.x;
            const relativeDistance = car.distance - this.distance;
            const isPlayerClosing = relativeDistance > 0 && relativeDistance < 280;
            const isSameLane = Math.abs(car.x - this.playerX) < 0.25;

            if (isPlayerClosing && isSameLane) {
                car.targetX = this.playerX <= 0 ? 0.55 : -0.55;
                car.desiredSpeed = Math.min(500, car.desiredSpeed + 90 * deltaTime);
            } else if (Math.abs(car.x - car.targetX) < 0.04) {
                car.targetX = car.targetX > 0 ? 0.62 : -0.62;
                car.desiredSpeed = 280 + (car.distance % 240) * 0.6;
            }

            car.x += Math.sign(car.targetX - car.x) * Math.min(Math.abs(car.targetX - car.x), deltaTime * 0.8);
            car.speed += Math.sign(car.desiredSpeed - car.speed) * Math.min(Math.abs(car.desiredSpeed - car.speed), deltaTime * 80);
            car.distance += Math.max(80, car.speed) * deltaTime;

            if (car.distance < this.distance - 180) car.distance += this.trackLength;
            if (car.distance > this.trackLength + 500) car.distance -= this.trackLength;

            if (relativeDistance > 0 && relativeDistance < 170 && Math.abs(car.x - this.playerX) < 0.22) {
                this.speed *= 0.35;
                this.playerX += car.x < this.playerX ? 0.08 : -0.08;
            }
        }
    }

    render(context, canvas, interpolation) {
        const renderDistance = this.interpolate(this.previousDistance, this.distance, interpolation);
        const renderPlayerX = this.interpolate(this.previousPlayerX, this.playerX, interpolation);
        this.renderSky(context, canvas);
        this.renderRoad(context, canvas, renderDistance);
        this.renderTraffic(context, canvas, renderDistance, renderPlayerX, interpolation);
        this.renderPlayer(context, canvas, renderPlayerX);
        this.renderHud(context, canvas);
        if (this.status !== 'playing') this.renderOverlay(context, canvas);
    }

    renderSky(context, canvas) {
        const sky = context.createLinearGradient(0, 0, 0, canvas.height * 0.56);
        sky.addColorStop(0, '#79c7e8');
        sky.addColorStop(1, '#d9f0dc');
        context.fillStyle = sky;
        context.fillRect(0, 0, canvas.width, canvas.height * 0.56);

        context.fillStyle = '#7cab75';
        context.beginPath();
        context.moveTo(0, canvas.height * 0.48);
        context.lineTo(canvas.width * 0.2, canvas.height * 0.37);
        context.lineTo(canvas.width * 0.36, canvas.height * 0.48);
        context.lineTo(canvas.width * 0.58, canvas.height * 0.35);
        context.lineTo(canvas.width, canvas.height * 0.47);
        context.lineTo(canvas.width, canvas.height * 0.58);
        context.lineTo(0, canvas.height * 0.58);
        context.fill();
    }

    renderRoad(context, canvas, renderDistance) {
        const horizon = canvas.height * 0.48;

        context.fillStyle = '#4d8b52';
        context.fillRect(0, horizon, canvas.width, canvas.height - horizon);

        const segmentOffset = renderDistance % this.segmentLength;
        const segmentCount = Math.ceil(this.viewDistance / this.segmentLength);
        for (let index = segmentCount - 1; index >= 0; index--) {
            const nearDistance = Math.max(0, index * this.segmentLength - segmentOffset);
            const farDistance = Math.min(this.viewDistance, (index + 1) * this.segmentLength - segmentOffset);
            if (farDistance <= 0 || farDistance <= nearDistance) continue;

            const near = this.getRoadPoint(canvas, nearDistance, renderDistance);
            const far = this.getRoadPoint(canvas, farDistance, renderDistance);
            context.fillStyle = index % 2 ? '#373b42' : '#30343a';
            this.drawTrapezoid(context, far.left, far.y, far.right, far.y, near.right, near.y, near.left, near.y);
            context.fill();

            const worldSegment = Math.floor((renderDistance + farDistance) / this.segmentLength);
            context.fillStyle = worldSegment % 2 ? '#eee1b5' : '#d64b45';
            this.drawTrapezoid(context, far.left - far.curbWidth, far.y, far.left, far.y,
                near.left, near.y, near.left - near.curbWidth, near.y);
            context.fill();
            this.drawTrapezoid(context, far.right, far.y, far.right + far.curbWidth, far.y,
                near.right + near.curbWidth, near.y, near.right, near.y);
            context.fill();

            if (worldSegment % 3 !== 0) {
                context.fillStyle = '#f4e7bd';
                for (const lane of [-1 / 3, 1 / 3]) {
                    const farLane = far.center + lane * far.width / 2;
                    const nearLane = near.center + lane * near.width / 2;
                    const farMarkerWidth = Math.max(1, far.width * 0.018);
                    const nearMarkerWidth = Math.max(2, near.width * 0.018);
                    this.drawTrapezoid(context, farLane - farMarkerWidth, far.y, farLane + farMarkerWidth, far.y,
                        nearLane + nearMarkerWidth, near.y, nearLane - nearMarkerWidth, near.y);
                    context.fill();
                }
            }
        }
    }

    getRoadPoint(canvas, relativeDistance, renderDistance = this.distance) {
        const depth = Math.max(0, Math.min(1, 1 - relativeDistance / this.viewDistance));
        const horizon = canvas.height * 0.48;
        const y = horizon + (canvas.height - horizon) * depth * depth;
        const width = 24 + (canvas.width * 0.9 - 24) * depth;
        const cameraCurve = this.getRoadCurve(renderDistance);
        const center = canvas.width / 2 + (this.getRoadCurve(renderDistance + relativeDistance) - cameraCurve) * depth;
        return {
            center,
            width,
            y,
            left: center - width / 2,
            right: center + width / 2,
            curbWidth: Math.max(2, width * 0.035)
        };
    }

    getRoadCurve(distance) {
        return Math.sin(distance / 700) * 65 + Math.sin(distance / 1300) * 35;
    }

    drawTrapezoid(context, topLeftX, topLeftY, topRightX, topRightY, bottomRightX, bottomRightY, bottomLeftX, bottomLeftY) {
        context.beginPath();
        context.moveTo(topLeftX, topLeftY);
        context.lineTo(topRightX, topRightY);
        context.lineTo(bottomRightX, bottomRightY);
        context.lineTo(bottomLeftX, bottomLeftY);
        context.closePath();
    }

    renderTraffic(context, canvas, renderDistance, renderPlayerX, interpolation) {
        for (const car of this.traffic) {
            const carDistance = this.interpolate(car.previousDistance, car.distance, interpolation);
            const carX = this.interpolate(car.previousX, car.x, interpolation);
            const relativeDistance = carDistance - renderDistance;
            if (relativeDistance <= 0 || relativeDistance > this.viewDistance) continue;

            const roadPoint = this.getRoadPoint(canvas, relativeDistance, renderDistance);
            const depth = Math.max(0.02, 1 - relativeDistance / this.viewDistance);
            const x = roadPoint.center + (carX - renderPlayerX) * roadPoint.width / 2;
            this.drawCar(context, x, roadPoint.y, 20 + depth * 42, 30 + depth * 66, car.color);
        }
    }

    renderPlayer(context, canvas, renderPlayerX) {
        const x = canvas.width / 2 + renderPlayerX * canvas.width * 0.32;
        this.drawCar(context, x, canvas.height - 72, this.playerWidth, this.playerHeight, '#ef4444');
    }

    interpolate(previous, current, interpolation) {
        return previous + (current - previous) * interpolation;
    }

    drawCar(context, x, y, width, height, color) {
        context.fillStyle = '#151a20';
        context.fillRect(x - width * 0.62, y - height * 0.32, width * 0.18, height * 0.48);
        context.fillRect(x + width * 0.44, y - height * 0.32, width * 0.18, height * 0.48);
        context.fillStyle = color;
        context.fillRect(x - width / 2, y - height, width, height);
        context.fillStyle = '#9bd0dc';
        context.fillRect(x - width * 0.31, y - height * 0.82, width * 0.62, height * 0.26);
        context.fillStyle = '#fef08a';
        context.fillRect(x - width * 0.35, y - height * 0.18, width * 0.18, height * 0.09);
        context.fillRect(x + width * 0.17, y - height * 0.18, width * 0.18, height * 0.09);
    }

    renderHud(context, canvas) {
        context.fillStyle = '#f8fafc';
        context.font = '18px Arial';
        context.textAlign = 'left';
        context.fillText(`SPEED ${Math.round(this.speed * 0.42)} KM/H`, 20, 30);
        context.fillText(`LAP ${Math.min(100, Math.round(this.distance / this.trackLength * 100))}%`, 20, 56);
        context.textAlign = 'right';
        context.fillText(`${this.fps} FPS`, canvas.width - 20, 30);
    }

    renderOverlay(context, canvas) {
        context.fillStyle = 'rgba(12, 20, 28, 0.6)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = '#f8fafc';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.font = '32px Arial';
        if (this.status === 'ready') context.fillText('PRESS ENTER TO RACE', canvas.width / 2, canvas.height / 2);
        if (this.status === 'finished') context.fillText('FINISH LINE - PRESS ENTER', canvas.width / 2, canvas.height / 2);
    }
}