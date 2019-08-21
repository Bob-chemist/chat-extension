const users = {};
let me;
let ip = '192.168.84.144:3000';
let unseenMessages = [],
  allMessages = [];
chrome.storage.sync.get(['code'], result => {
  me = result.code;
});
chrome.storage.sync.get(['ip'], result => {
  ip = result.ip;
});


const sendToPopup = msg => chrome.runtime.sendMessage(msg);

chrome.runtime.onMessage.addListener(messageReceived);

chrome.runtime.onConnect.addListener(function(port) {
  port.onDisconnect.addListener(function() {
    console.log('popup closed');

    socket.emit('user online', me);
  });
});

function messageReceived(message) {
  if (message.receiver) {
    message.receiver !== '_chat'
      ? socket.emit('private message', message)
      : socket.emit('chat message', message);
  } else if (message.id === 'hi') {
    sendToPopup({ id: 'userList', userList: users });
    sendToPopup({ id: 'messageList', messageList: allMessages });
    unseenMessages = [];
    chrome.browserAction.setBadgeText({ text: '' });
  } else if (message.id === 'get old') {
    let latest = new Date().getTime();
    for (let i = 0; i < allMessages.length; i++) {
      const { author, receiver, id } = allMessages[i];
      if (
        (author === me && receiver === message.userId) ||
        (author === message.userId && receiver === me)
      ) {
        latest = +id;
        break;
      }
    }
    const msg = { userId: me, companionId: message.userId, latest };
    socket.emit('get old', msg);
  }
}

import io from 'socket.io-client';

const socket = io.connect('http://' + ip);

socket.on('connect', () => {
  console.info('Connected to server');
  socket.emit('name', me);
});

socket.on('userList', userList => {
  userList.forEach(user => (users[user.userid] = user));
  socket.emit('userList loaded', me);
});

socket.on('unseen messages', msg => {
  console.log('unseen messages', msg);

  unseenMessages = [...unseenMessages, ...msg];
  allMessages = [...allMessages, ...msg];
  showNotification(msg);
});

socket.on('old messages', msg => {
  console.log('old messages', msg);
  allMessages = [...msg, ...allMessages];
  if (chrome.extension.getViews({ type: 'popup' })[0]) {
    sendToPopup({ id: 'messageList', messageList: msg });
  }
});

socket.on('private message', msg => {
  console.log('private message', msg);

  allMessages = [...allMessages, ...msg];
  if (chrome.extension.getViews({ type: 'popup' })[0]) {
    sendToPopup({ id: 'singleMessage', message: msg });
  } else {
    unseenMessages = [...unseenMessages, ...msg];
  }
  showNotification(msg);
});

socket.on('chat message', msg => {
  console.log('chat message', msg);

  allMessages = [...allMessages, ...msg];
  if (chrome.extension.getViews({ type: 'popup' })[0]) {
    sendToPopup({ id: 'singleMessage', message: msg });
  } else {
    unseenMessages = [...unseenMessages, ...msg];
  }
  showNotification(msg);
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

function showNotification(data) {
  let badge = unseenMessages.length ? unseenMessages.length.toString() : '';
  chrome.browserAction.setBadgeText({ text: badge });
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
