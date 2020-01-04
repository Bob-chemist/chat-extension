import io from 'socket.io-client';

let users = {},
    me,
    password,
    ip = '192.168.84.144:3000',
    unseenMessages = [],
    allMessages = [];

chrome.storage.sync.get([ 'code' ], (result) => {
    me = result.code;
});

chrome.storage.sync.get([ 'password' ], (result) => {
    password = result.password;
});

chrome.storage.sync.get([ 'ip' ], (result) => {
    ip = result.ip;
});

const sendToPopup = (msg) => chrome.runtime.sendMessage(msg);

chrome.runtime.onMessage.addListener(messageReceived);

chrome.runtime.onConnect.addListener(function(port) {
    port.onDisconnect.addListener(function() {
        socket.emit('user online', me);
    });
});

function messageReceived(message) {
    let msg = {};

    switch (message.id) {
        case 'hi':
            sendToPopup({ id: 'userList', userList: users });
            sendToPopup({ id: 'messageList', messageList: allMessages });
            unseenMessages = [];
            chrome.browserAction.setBadgeText({ text: '' });
            break;

        case 'authentication':
            socket.emit('authentication', message);
            break;

        case 'send':
            msg = {
                author: message.author,
                receiver: message.receiver,
                message: message.message,
            };

            allMessages.unshift(msg);
            msg.receiver !== '_chat'
                ? socket.emit('private message', msg)
                : socket.emit('chat message', msg);
            break;

        case 'get old':
            msg = {
                userId: me,
                companionId: message.userId,
                offset: message.offset,
            };

            socket.emit('get old', msg);
            break;

        case 'typing':
            msg = { userId: me, receiver: message.receiver };

            console.log(msg);
            socket.emit('typing', msg);
            break;

        case 'set read history':
            msg = {
                userId: me,
                limit: message.limit,
                chatId: message.chatId,
            };
            socket.emit('set read history', msg);
            break;
    }
}

const socket = io.connect('http://' + ip);

console.log('ip ' + ip);

socket.on('connect', () => {
    console.info('Connected to server');
    socket.emit('name', me);
});

socket.on('authorized', (authorized) => {
    sendToPopup({ id: 'authorized', authorized: authorized });
});

socket.on('typing', (userId) => {
    console.log('Typing ', userId);
    sendToPopup({ id: 'typing', userId });
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
    allMessages = [];
    unseenMessages = [];
    users = {};
});

socket.on('userList', (userList) => {
    userList.forEach((user) => (users[user.userid] = user));
    socket.emit('userList loaded', me);
});

socket.on('unseen messages', (msg) => {
    console.log('unseen messages', msg);
    setToLocalStorage(msg);
    unseenMessages = [ ...msg, ...unseenMessages ];
    //allMessages = [ ...msg, ...allMessages ];
    showNotification(msg);
});

socket.on('old messages', (msg) => {
    console.log('old messages', msg);
    allMessages = [ ...allMessages, ...msg ];

    if (chrome.extension.getViews({ type: 'popup' })[0]) {
        sendToPopup({ id: 'messageList', messageList: msg });
    }
});

socket.on('private message', (msg) => {
    console.log('private message', msg);

    allMessages = [ ...msg, ...allMessages ];

    if (chrome.extension.getViews({ type: 'popup' })[0]) {
        sendToPopup({ id: 'singleMessage', message: msg });
    } else {
        const unseenUserMessages = JSON.parse(localStorage.getItem('unseenMessages' + msg.author));

        localStorage.setItem('unseenMessages' + msg.author, JSON.stringify(unseenUserMessages.push(msg)));
        unseenMessages = [ ...unseenMessages, ...msg ];
    }

    showNotification(msg);
});

socket.on('chat message', (msg) => {
    console.log('chat message', msg);

    allMessages = [ ...allMessages, ...msg ];

    if (chrome.extension.getViews({ type: 'popup' })[0]) {
        sendToPopup({ id: 'singleMessage', message: msg });
    } else {
        const unseenChatMessages = JSON.parse(localStorage.getItem('unseenMessages_chat'));

        localStorage.setItem('unseenMessages_chat', JSON.stringify(unseenChatMessages.push(msg)));
        unseenMessages = [ ...unseenMessages, ...msg ];
    }

    showNotification(msg);
});

socket.on('user connected', (userId) => {
    if (userId === me) {
        return;
    }

    console.log('user connected', userId);
    sendToPopup({ id: 'connected', userId });
});

socket.on('user disconnected', (userId) => {
    if (userId === me) {
        return;
    }

    console.log('user disconnected', userId);
    sendToPopup({ id: 'disconnected', userId });
});

function showNotification(data) {
    const badge = unseenMessages.length ? unseenMessages.length.toString() : '';

    chrome.browserAction.setBadgeText({ text: badge });

    if (data.length > 1) {
        const showData = data.map((msg) => {
            return { title: users[msg.author].name, message: msg.message };
        });

        chrome.notifications.create('reminder', {
            type: 'list',
            iconUrl: './icons/icon_128.png',
            title: 'Новые сообщения',
            message: 'Срочно прочесть',
            items: showData,
            requireInteraction: true,
        });
    } else {
        const msg = data[0];

        if (msg.author === me) {
            return;
        }

        const requireInteraction = msg.message[0] === '!',
              iconUrl = msg.message[0] === '!' ? './icons/exclamation.jpg' : './icons/icon_128.png',
              title = 'Новое сообщение от: ' + users[msg.author].name,
              body = msg.message;

        chrome.notifications.create('reminder', {
            type: 'basic',
            iconUrl,
            title,
            message: body,
            requireInteraction,
        });

        if (requireInteraction) {
            speechSynthesis.speak(new SpeechSynthesisUtterance('Мой господин, вам важное сообщение пришло'));
        }
    }
}

function setToLocalStorage(messagesArray) {
    for (const userId in users) {
        const sortedArray = messagesArray.filter((el) => el.author === userId && el.receiver !== '_chat');

        localStorage.setItem('unseenMessages' + userId, JSON.stringify(sortedArray));
    }

    const chatArray = messagesArray.filter((el) => el.receiver === '_chat');

    localStorage.setItem('unseenMessages_chat', JSON.stringify(chatArray));
}
