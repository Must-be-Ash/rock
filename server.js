const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const port = process.env.PORT || 3000;
let emojis = [];

app.use(express.static('public'));

io.on('connection', (socket) => {
  console.log('a user connected');

  // Send current emojis to the new user
  socket.emit('currentEmojis', emojis);

  // Handle emoji selection
  socket.on('selectEmoji', (emoji) => {
    if (emojis.length < 3) {
      emojis.push(emoji);
      io.emit('emojiAdded', emoji);

      if (emojis.length === 3) {
        io.emit('startGame', emojis);
      }
    }
  });

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
