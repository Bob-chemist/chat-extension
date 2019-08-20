const users = {};
let me;
let messages = [];
chrome.storage.sync.get(['code'], result => {
  me = result.code;
});

//for sending a message
const sendToPopup = msg => chrome.runtime.sendMessage(msg);

chrome.runtime.onMessage.addListener(messageReceived);

function messageReceived(message) {
  if (message.receiver) {
    message.receiver !== '_chat'
      ? socket.emit('private message', message)
      : socket.emit('chat message', message);
  } else if (message.id === 'hi') {
    socket.emit('user online', message.userId);
    sendToPopup({ id: 'userList', userList: users });
    sendToPopup({ id: 'messageList', messageList: messages });
    messages = [];
    chrome.browserAction.setBadgeText({ text: '' });
  }
}

import io from 'socket.io-client';

const socket = io.connect('http://localhost:3000');

socket.on('connect', () => {
  //При успешном соединении с сервером
  console.info('Connected to server');
  socket.emit('name', me);
});

socket.on('userList', userList => {
  userList.forEach(user => (users[user.userid] = user));
  socket.emit('userList loaded', me);
});

socket.on('unseen messages', msg => {
  messages = [...messages, ...msg];
  showNotification(msg);
});

socket.on('private message', msg => {
  messages = [...messages, ...msg];
  console.log(messages);
  sendToPopup({ id: 'messageList', messageList: msg });
  // show(msg);
});

socket.on('chat message', msg => {
  messages = [...messages, ...msg];
  console.log(messages);
  sendToPopup({ id: 'messageList', messageList: msg });
  // show(msg);
});

socket.on('user connected', userId => {
  if (userId === me) {
    return;
  }
  console.log('user connected', userId);
  sendToPopup({ id: 'connected', userId });
});

socket.on('user disconnected', userId => {
  if (userId === me) {
    return;
  }
  console.log('user disconnected', userId);
  sendToPopup({ id: 'disconnected', userId });
});

// function show(msgs) {
//   sendToPopup({ id: 'messageList', messageList: msgs });
//   chrome.browserAction.setBadgeText({ text: messages.length.toString() });
//   let msg = msgs[0];

//   if (msg.author === me) {
//     return;
//   }

//   let title = 'Новое сообщение от: ' + users[msg.author].name,
//     body = msg.message;

//   chrome.notifications.create('reminder', {
//     type: 'basic',
//     iconUrl: 'icons/icon_128.png',
//     title,
//     message: body,
//     requireInteraction: true,
//   });
// }

function showNotification(data) {
  // показываем уведомление, состоящее их названия предмета и баллов
  chrome.browserAction.setBadgeText({ text: messages.length.toString() });
  if (data.length > 1) {
    let showData = data.map(msg => {
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
    let msg = data[0];

    if (msg.author === me) {
      return;
    }
    let title = 'Новое сообщение от: ' + users[msg.author].name,
      body = msg.message;
    chrome.notifications.create('reminder', {
      type: 'basic',
      iconUrl: './icons/icon_128.png',
      title,
      message: body,
      requireInteraction: true,
    });
  }
}
