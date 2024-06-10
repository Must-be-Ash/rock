const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
let emojis = [];
let gameStarted = false;
let users = new Set();
let gameTimeout;

app.use(express.static('public'));

io.on('connection', (socket) => {
    if (gameStarted) {
        socket.emit('gameInProgress');
        return;
    }

    users.add(socket.id);
    console.log('a user connected');

    socket.emit('currentEmojis', emojis);

    socket.on('selectEmoji', (emoji) => {
        if (!gameStarted && emojis.length < 3 && !emojis.some(e => e.id === socket.id)) {
            emojis.push({ id: socket.id, emoji });
            io.emit('emojiAdded', emoji);

            if (emojis.length === 3) {
                startGame();
            }
        }
    });

    socket.on('disconnect', () => {
        users.delete(socket.id);
        console.log('user disconnected');
    });
});

function startGame() {
    gameStarted = true;
    io.emit('startGame', emojis);
    gameTimeout = setTimeout(() => {
        runGame();
    }, 30000); // 30-second delay before starting the game
}

function runGame() {
    io.emit('runGame');
    let gameInterval = setInterval(() => {
        const counts = { '🪨': 0, '🧻': 0, '✂️': 0 };
        emojis.forEach(({ emoji }) => counts[emoji]++);

        if (counts['🪨'] > 0 && counts['✂️'] > 0 && counts['🧻'] === 0) {
            endGame('🪨');
        } else if (counts['🪨'] > 0 && counts['🧻'] > 0 && counts['✂️'] === 0) {
            endGame('🧻');
        } else if (counts['🧻'] > 0 && counts['✂️'] > 0 && counts['🪨'] === 0) {
            endGame('✂️');
        }
    }, 20);
}

function endGame(winner) {
    clearTimeout(gameTimeout);
    gameStarted = false;
    emojis = [];
    io.emit('endGame', winner);
    setTimeout(() => {
        io.emit('resetGame');
    }, 5000); // 5 seconds before allowing new game
}

server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
