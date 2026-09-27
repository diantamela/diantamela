// Pearl Pacman Engine - Feminine Pastel Theme
const pCanvas = document.getElementById('pacmanCanvas');
const pCtx = pCanvas.getContext('2d');

const TILE = 20;
const ROWS = 20;
const COLS = 20;

const baseMap = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,2,0,0,0,0,1,0,0,0,0,0,0,1,0,0,0,0,2,1],
    [1,0,1,1,0,0,1,0,1,1,1,1,0,1,0,0,1,1,0,1],
    [1,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,1],
    [1,0,0,0,0,1,1,0,1,1,1,1,0,1,1,0,0,0,0,1],
    [1,1,1,0,0,1,0,0,0,3,3,0,0,0,1,0,0,1,1,1],
    [3,3,1,0,0,1,0,1,1,3,3,1,1,0,1,0,0,1,3,3],
    [1,1,1,0,0,0,0,1,3,3,3,3,1,0,0,0,0,1,1,1],
    [1,0,0,0,1,1,0,1,1,1,1,1,1,0,1,1,0,0,0,1],
    [1,0,1,0,0,0,0,0,0,3,3,0,0,0,0,0,0,1,0,1],
    [1,0,1,0,1,1,0,1,1,1,1,1,1,0,1,1,0,1,0,1],
    [1,1,1,0,1,1,0,0,0,3,3,0,0,0,1,1,0,1,1,1],
    [3,3,1,0,0,0,0,1,1,1,1,1,1,0,0,0,0,1,3,3],
    [1,1,1,0,1,1,0,0,0,0,0,0,0,0,1,1,0,1,1,1],
    [1,0,0,0,0,1,0,1,1,1,1,1,1,0,1,0,0,0,0,1],
    [1,0,1,1,0,0,0,0,0,1,1,0,0,0,0,0,1,1,0,1],
    [1,0,0,1,0,1,1,1,0,1,1,0,1,1,1,0,1,0,0,1],
    [1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
    [1,2,0,1,1,1,0,1,1,1,1,1,1,0,1,1,1,0,2,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

let map = [];
let pacman = { x: 9, y: 13, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0.2, mouthSpeed: 0.05 };
let ghosts = [];
let pScore = 0;
let pLives = 3;
let pInterval = null;
let isPacmanRunning = false;
let scaredTimer = 0;

const pOverlay = document.getElementById('pacman-overlay');
const startPacmanBtn = document.getElementById('start-pacman-btn');
const pScoreEl = document.getElementById('pacman-score');
const pLivesEl = document.getElementById('pacman-lives');

startPacmanBtn.addEventListener('click', initPacmanGame);

function initPacmanGame() {
    map = JSON.parse(JSON.stringify(baseMap));
    pacman = { x: 9, y: 13, dx: 0, dy: 0, nextDx: 0, nextDy: 0, mouth: 0.2, mouthSpeed: 0.05 };
    ghosts = [
        { x: 9, y: 8, color: '#c77dff', dx: 1, dy: 0 },
        { x: 10, y: 8, color: '#ff85a1', dx: -1, dy: 0 },
        { x: 9, y: 9, color: '#a8edd5', dx: 0, dy: -1 },
        { x: 10, y: 9, color: '#ffbc9a', dx: 0, dy: 1 }
    ];
    pScore = 0;
    pLives = 3;
    scaredTimer = 0;
    pScoreEl.innerText = pScore;
    pLivesEl.innerText = pLives;

    pOverlay.style.display = 'none';
    isPacmanRunning = true;

    if (pInterval) clearInterval(pInterval);
    pInterval = setInterval(pacmanLoop, 150);
}

function pacmanLoop() {
    if (!isPacmanRunning) return;
    if (scaredTimer > 0) scaredTimer--;

    movePacman();
    moveGhosts();
    checkPacmanCollisions();
    drawPacmanGame();
}

function movePacman() {
    if (canMove(pacman.x + pacman.nextDx, pacman.y + pacman.nextDy)) {
        pacman.dx = pacman.nextDx;
        pacman.dy = pacman.nextDy;
    }

    if (canMove(pacman.x + pacman.dx, pacman.y + pacman.dy)) {
        pacman.x += pacman.dx;
        pacman.y += pacman.dy;

        if (pacman.x < 0) pacman.x = COLS - 1;
        if (pacman.x >= COLS) pacman.x = 0;

        const currentTile = map[pacman.y][pacman.x];
        if (currentTile === 0) {
            map[pacman.y][pacman.x] = 3;
            pScore += 10;
        } else if (currentTile === 2) {
            map[pacman.y][pacman.x] = 3;
            pScore += 50;
            scaredTimer = 30;
        }
        pScoreEl.innerText = pScore;
    }

    pacman.mouth += pacman.mouthSpeed;
    if (pacman.mouth > 0.4 || pacman.mouth < 0.05) pacman.mouthSpeed = -pacman.mouthSpeed;
}

function moveGhosts() {
    ghosts.forEach(g => {
        const possibleMoves = [];
        const directions = [
            { dx: 0, dy: -1 }, { dx: 0, dy: 1 },
            { dx: -1, dy: 0 }, { dx: 1, dy: 0 }
        ];

        directions.forEach(d => {
            if (d.dx !== -g.dx || d.dy !== -g.dy) {
                if (canMove(g.x + d.dx, g.y + d.dy)) possibleMoves.push(d);
            }
        });

        if (possibleMoves.length === 0) {
            directions.forEach(d => {
                if (canMove(g.x + d.dx, g.y + d.dy)) possibleMoves.push(d);
            });
        }

        if (possibleMoves.length > 0) {
            const move = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            g.dx = move.dx; g.dy = move.dy;
            g.x += g.dx; g.y += g.dy;
        }
    });
}

function canMove(x, y) {
    if (x < 0 || x >= COLS) return true;
    if (y < 0 || y >= ROWS) return false;
    return map[y][x] !== 1;
}

function checkPacmanCollisions() {
    ghosts.forEach(g => {
        if (g.x === pacman.x && g.y === pacman.y) {
            if (scaredTimer > 0) {
                pScore += 200;
                pScoreEl.innerText = pScore;
                g.x = 9; g.y = 8;
            } else {
                pLives--;
                pLivesEl.innerText = pLives;
                if (pLives <= 0) {
                    endPacmanGame('GAME OVER');
                } else {
                    pacman.x = 9; pacman.y = 13; pacman.dx = 0; pacman.dy = 0;
                }
            }
        }
    });

    let dotsRemaining = false;
    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            if (map[r][c] === 0 || map[r][c] === 2) dotsRemaining = true;
        }
    }
    if (!dotsRemaining) endPacmanGame('VICTORY!');
}

function endPacmanGame(title) {
    isPacmanRunning = false;
    clearInterval(pInterval);
    pOverlay.style.display = 'flex';
    pOverlay.querySelector('h3').innerText = title;
    pOverlay.querySelector('p').innerText = `Skor Akhir: ${pScore}`;
    startPacmanBtn.innerText = 'PLAY AGAIN';
}

function drawPacmanGame() {
    pCtx.fillStyle = '#0d0814';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

    for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
            const tile = map[r][c];
            if (tile === 1) {
                pCtx.shadowBlur = 4;
                pCtx.shadowColor = '#e0a96d';
                pCtx.fillStyle = '#23162b';
                pCtx.strokeStyle = 'rgba(224, 169, 109, 0.4)';
                pCtx.fillRect(c * TILE, r * TILE, TILE, TILE);
                pCtx.strokeRect(c * TILE, r * TILE, TILE, TILE);
            } else if (tile === 0) {
                pCtx.shadowBlur = 4;
                pCtx.shadowColor = '#ffe6a7';
                pCtx.fillStyle = '#ffe6a7';
                pCtx.beginPath();
                pCtx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, 3, 0, Math.PI * 2);
                pCtx.fill();
            } else if (tile === 2) {
                pCtx.shadowBlur = 10;
                pCtx.shadowColor = '#ff70a6';
                pCtx.fillStyle = '#ff70a6';
                pCtx.beginPath();
                pCtx.arc(c * TILE + TILE / 2, r * TILE + TILE / 2, 6, 0, Math.PI * 2);
                pCtx.fill();
            }
        }
    }

    pCtx.shadowBlur = 12;
    pCtx.shadowColor = '#ff70a6';
    pCtx.fillStyle = '#ff70a6';
    pCtx.beginPath();
    let angle = 0;
    if (pacman.dx === 1) angle = 0;
    else if (pacman.dx === -1) angle = Math.PI;
    else if (pacman.dy === 1) angle = Math.PI / 2;
    else if (pacman.dy === -1) angle = -Math.PI / 2;

    pCtx.arc(
        pacman.x * TILE + TILE / 2,
        pacman.y * TILE + TILE / 2,
        TILE / 2 - 2,
        angle + pacman.mouth * Math.PI,
        angle + (2 - pacman.mouth) * Math.PI
    );
    pCtx.lineTo(pacman.x * TILE + TILE / 2, pacman.y * TILE + TILE / 2);
    pCtx.fill();

    ghosts.forEach(g => {
        pCtx.shadowBlur = 10;
        pCtx.shadowColor = scaredTimer > 0 ? '#ffb6c1' : g.color;
        pCtx.fillStyle = scaredTimer > 0 ? '#ffb6c1' : g.color;

        pCtx.beginPath();
        pCtx.arc(g.x * TILE + TILE / 2, g.y * TILE + TILE / 3, TILE / 2 - 2, Math.PI, 0, false);
        pCtx.lineTo(g.x * TILE + TILE - 2, g.y * TILE + TILE);
        pCtx.lineTo(g.x * TILE + 2, g.y * TILE + TILE);
        pCtx.fill();

        pCtx.fillStyle = '#fff';
        pCtx.beginPath();
        pCtx.arc(g.x * TILE + 6, g.y * TILE + 6, 2.5, 0, Math.PI * 2);
        pCtx.arc(g.x * TILE + 14, g.y * TILE + 6, 2.5, 0, Math.PI * 2);
        pCtx.fill();
    });

    pCtx.shadowBlur = 0;
}

document.addEventListener('keydown', (e) => {
    if (!isPacmanRunning) return;
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') { pacman.nextDx = 0; pacman.nextDy = -1; }
    else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') { pacman.nextDx = 0; pacman.nextDy = 1; }
    else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') { pacman.nextDx = -1; pacman.nextDy = 0; }
    else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') { pacman.nextDx = 1; pacman.nextDy = 0; }
});

document.getElementById('p-up').addEventListener('click', () => { pacman.nextDx = 0; pacman.nextDy = -1; });
document.getElementById('p-down').addEventListener('click', () => { pacman.nextDx = 0; pacman.nextDy = 1; });
document.getElementById('p-left').addEventListener('click', () => { pacman.nextDx = -1; pacman.nextDy = 0; });
document.getElementById('p-right').addEventListener('click', () => { pacman.nextDx = 1; pacman.nextDy = 0; });

drawPacmanGame();
