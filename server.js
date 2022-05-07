const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const formatMessage = require('./utils/messages');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers,
} = require('./utils/users');

const app = express();
app.use(express.static(path.join(__dirname, 'public')));
const server = http.createServer(app);
const io = socketio(server);
const bot = 'ChatCord Bot';

io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        socket.emit('message', formatMessage(bot, 'Welcome to ChatCord!'));

        socket.broadcast
            .to(user.room)
            .emit(
                'message',
                formatMessage(bot, `${user.username} has joined the chat`)
            );

        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });

    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    socket.on('disconnect', () => {
        const user = userLeave(socket.id);
        if (user) {
            socket.broadcast
                .to(user.room)
                .emit(
                    'message',
                    formatMessage(bot, `${user.username} has left the chat`)
                );
        }
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room),
        });
    });
});

const PORT = process.env.PORT;

server.listen(PORT, () => {
    console.log('App running...');
});
