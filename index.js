const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const port = 80;

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static('public'));

let users = {};

io.on('connection', (socket) => {
  console.log("S'ha connectat algú");

  socket.on('join', (data) => {
    const username = data.username;
    users[username] = {
      score: 0,
      answeredQuestions: {}
    };
    socket.username = username;
    io.emit('scoresUpdate', users);
    io.emit('userConnected', username);
  });

  socket.on('updateScore', (data) => {
    const { username, score, answeredQuestions } = data;
    users[username] = {
      score: score,
      answeredQuestions: answeredQuestions
    };
    io.emit('scoresUpdate', users);
  });

  socket.on('userChatMessage', (data) => {
    io.emit('userChatMessage', data);
  });

  socket.on('disconnect', () => {
    console.log("S'ha desconnectat");
    if (socket.username) {
      io.emit('userDisconnected', socket.username);
      delete users[socket.username];
      io.emit('scoresUpdate', users);
    }
  });
});

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
