import express from 'express';
import morgan from 'morgan';
import { Server as SocketServer } from 'socket.io';
import http from 'http';
import cors from 'cors';
import { PORT } from './config.js';

const app = express();
const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: {
    origin: "*",
  }
});

app.use(cors());
app.use(morgan('dev'));

let onlineUsers = [];

io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  socket.on('userConnected', (username) => {
    onlineUsers.push({ id: socket.id, username });
    io.emit('users', onlineUsers.map(user => user.username));
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    onlineUsers = onlineUsers.filter(user => user.id !== socket.id);
    io.emit('users', onlineUsers.map(user => user.username));
  });

  socket.on('message', (msg) => {
    socket.broadcast.emit('message', { body: msg.body, user: msg.user });
  });
});

server.listen(PORT);
console.log("Server started on port: " + PORT);
