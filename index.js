const express = require('express');
const http = require('http');
const cors = require('cors');
const socketIo = require('socket.io');

const port = process.env.PORT || 4001;

const app = express();

app.use(cors());

const server = http.createServer(app);

const io = socketIo(server); // < Interesting!

app.get('/', function (req, res) {
  res.send('alive');
});

let latestTime = 0,
  watching = 0,
  loadingFinished;

io.on('connection', (socket) => {
  console.log('New client connected');
  watching++;
  socket.emit('initial', latestTime);

  socket.on('play', (data) => {
    console.log('played', data);
    socket.broadcast.emit('gotPlayed', data);
    console.log('latestTime', latestTime);
  });

  socket.on('pause', (data) => {
    console.log('paused', data);
    latestTime = data;
    socket.broadcast.emit('gotPaused', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
    watching--;
    if (!watching) latestTime = 0;
  });
});

server.listen(port, () => console.log(`Listening on port ${port}`));
