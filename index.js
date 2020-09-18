var express = require('express')
var app = express();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var names = {};

app.use(express.static('dist'));

http.listen(80, () => {
  console.log('listening on *:80');
});


io.on('connection', (socket) => {
  socket.on('message', (message) => {
    const room = getRoom(socket);

    if(room) {
      io.to(room).emit('message', message);
    }
  });

  socket.on('joinRoom', ({room, user}) => {
    names[socket.id] = user;
    socket.join(room);

    sendPresence(room);
  });

  socket.on('disconnecting', () => {
    const room = getRoom(socket);
    delete names[socket.id];

    sendPresence(room, -1);
  });
});

function getRoom(socket) {
  const rooms = Object.keys(socket.rooms);
  if(typeof rooms[1] !== 'undefined') return rooms[1];

  return false;
}

function sendPresence(room, countDiff = 0) {
  const data = io.sockets.adapter.rooms[room];
  if(typeof io.sockets.adapter.rooms[room] === 'undefined') return false;

  const users = Object.keys(data.sockets).map((socketId) => names[socketId]);

  io.to(room).emit('presence', {
    count: data.length + countDiff,
    users
  });
}
