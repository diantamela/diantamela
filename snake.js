// Espresso & Dark Brown Snake Engine
const canvas = document.getElementById('snakeCanvas');
const ctx = canvas.getContext('2d');

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [];
let food = { x: 15, y: 15 };
let dx = gridSize;
let dy = 0;
let score = 0;
let highScore = localStorage.getItem('espresso_snake_high_score') || 0;
let gameInterval = null;
let isRunning = false;

document.getElementById('snake-high').innerText = highScore;

const overlay = document.getElementById('snake-overlay');
const startBtn = document.getElementById('start-snake-btn');
const scoreEl = document.getElementById('snake-score');

startBtn.addEventListener('click', startGame);

function startGame() {
    snake = [
        { x: 5 * gridSize, y: 10 * gridSize },
        { x: 4 * gridSize, y: 10 * gridSize },
        { x: 3 * gridSize, y: 10 * gridSize }
    ];
    dx = gridSize;
    dy = 0;
    score = 0;
    scoreEl.innerText = score;
    spawnFood();
    overlay.style.display = 'none';
    isRunning = true;

    if (gameInterval) clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, 100);
}

function spawnFood() {
    food = {
        x: Math.floor(Math.random() * tileCount) * gridSize,
        y: Math.floor(Math.random() * tileCount) * gridSize
    };
    snake.forEach(part => {
        if (part.x === food.x && part.y === food.y) spawnFood();
    });
}

function gameLoop() {
    if (!isRunning) return;
    moveSnake();
    if (checkCollision()) {
        gameOver();
        return;
    }
    draw();
}

function moveSnake() {
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };
    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score += 10;
        scoreEl.innerText = score;
        if (score > highScore) {
            highScore = score;
            localStorage.setItem('espresso_snake_high_score', highScore);
            document.getElementById('snake-high').innerText = highScore;
        }
        spawnFood();
    } else {
        snake.pop();
    }
}

function checkCollision() {
    const head = snake[0];
    if (head.x < 0 || head.x >= canvas.width || head.y < 0 || head.y >= canvas.height) {
        return true;
    }
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }
    return false;
}

function draw() {
    ctx.fillStyle = '#0f0a06';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = 'rgba(212, 163, 115, 0.08)';
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Food (Coffee Bean / Amber Pearl)
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#d4a373';
    ctx.fillStyle = '#faedcd';
    ctx.beginPath();
    ctx.arc(food.x + gridSize / 2, food.y + gridSize / 2, gridSize / 2 - 2, 0, Math.PI * 2);
    ctx.fill();

    // Snake (GitHub contribution green / warm bronze)
    snake.forEach((part, index) => {
        if (index === 0) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#388e3c';
            ctx.fillStyle = '#4caf50';
        } else {
            ctx.shadowBlur = 6;
            ctx.shadowColor = '#2e7d32';
            ctx.fillStyle = index % 2 === 0 ? '#388e3c' : '#2e7d32';
        }
        ctx.fillRect(part.x + 1, part.y + 1, gridSize - 2, gridSize - 2);
    });

    ctx.shadowBlur = 0;
}

function gameOver() {
    isRunning = false;
    clearInterval(gameInterval);
    overlay.style.display = 'flex';
    overlay.querySelector('h3').innerText = 'GAME OVER';
    overlay.querySelector('p').innerText = `Skor Akhir: ${score}`;
    startBtn.innerText = 'PLAY AGAIN';
}

document.addEventListener('keydown', (e) => {
    if (!isRunning) return;
    if ((e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') && dy === 0) { dx = 0; dy = -gridSize; }
    else if ((e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') && dy === 0) { dx = 0; dy = gridSize; }
    else if ((e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') && dx === 0) { dx = -gridSize; dy = 0; }
    else if ((e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') && dx === 0) { dx = gridSize; dy = 0; }
});

document.getElementById('s-up').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = -gridSize; } });
document.getElementById('s-down').addEventListener('click', () => { if (dy === 0) { dx = 0; dy = gridSize; } });
document.getElementById('s-left').addEventListener('click', () => { if (dx === 0) { dx = -gridSize; dy = 0; } });
document.getElementById('s-right').addEventListener('click', () => { if (dx === 0) { dx = gridSize; dy = 0; } });

draw();
