const users = {};
let me;
let messages = [];
chrome.storage.sync.get(['code'], result => {
  me = result.code;
});

//for sending a message
const sendToPopup = msg => chrome.runtime.sendMessage(msg);

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

chrome.runtime.onConnect.addListener(function(port) {
  port.onMessage.addListener(function(message) {
    console.log(message);
    port.postMessage({ id: 'userList', userList: users });
    port.postMessage({ id: 'messageList', messageList: messages });

    if (message.receiver) {
      message.receiver !== '_chat'
        ? socket.emit('private message', message)
        : socket.emit('chat message', message);
    }
  });
});

socket.on('private message', msg => {
  messages = [...messages, ...msg];
});

socket.on('chat message', msg => {
  messages = [...messages, ...msg];
});

socket.on('user connected', userId => {
  if (userId === me) {
    return;
  }
  sendToPopup({ id: 'connected', userId });
});

socket.on('user disconnected', userId => {
  if (userId === me) {
    return;
  }
  sendToPopup({ id: 'disconnected', userId });
});

chrome.alarms.create('1min', {
  // Повторяем код ниже каждую минуту
  delayInMinutes: 1,
  periodInMinutes: 1,
});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === '1min') {
  }
});

var curDate = new Date();

function showNotification(data) {
  // показываем уведомление, состоящее их названия предмета и баллов
  if (data.length > 1) {
    data = data.map(m => {
      return { title: m.title, message: m.message };
    });

    chrome.notifications.create('reminder', {
      type: 'list',
      iconUrl: 'icon.png',
      title: 'Новые сообщения',
      items: data,
      message: 'test',
      requireInteraction: true,
    });
  } else {
    chrome.notifications.create('reminder', {
      type: 'basic',
      iconUrl: 'icon.png',
      title: data[0].title,
      message: data[0].message,
      requireInteraction: true,
    });
  }
}
