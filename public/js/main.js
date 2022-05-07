const socket = io();
const chatForm = document.getElementById('chat-form');
const chatMessages = document.getElementsByClassName('chat-messages')[0];

const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

socket.emit('joinRoom', { username, room });

socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

socket.on('message', (message) => {
    console.log(message);
    outputMessages(message);
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const msg = e.target.elements.msg.value;
    socket.emit('chatMessage', msg);
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
});

function outputMessages(msg) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${msg.username} <span>${msg.time}</span></p>
    <p class="text">
        ${msg.text}
    </p>`;
    chatMessages.append(div);
}

function outputRoomName(room) {
    document.getElementById('room-name').innerHTML = room;
}

function outputUsers(users) {
    let usersCont = document.getElementById('users');
    usersCont.innerHTML = '';
    users.forEach((user) => {
        let li = document.createElement('li');
        li.innerHTML = user.username;
        usersCont.append(li);
    });
}
