const express = require('express');
const path = require('path');

const app = express();
let gameInProgress = false;
let countdown = 30;
let countdownTimer;

app.use(express.static('public'));

app.get('/timer', (req, res) => {
    res.json({ countdown, gameInProgress });
});

function startCountdown() {
    countdown = 30;
    gameInProgress = false;

    countdownTimer = setInterval(() => {
        countdown--;

        if (countdown <= 0) {
            clearInterval(countdownTimer);
            gameInProgress = true;
            setTimeout(() => {
                gameInProgress = false;
                startCountdown();
            }, 30000); // 30 seconds for the game duration
        }
    }, 1000);
}

startCountdown();

app.listen(3000, () => {
    console.log('Server listening on port 3000');
});
