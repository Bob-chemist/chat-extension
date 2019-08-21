let users = {};
let me;
chrome.storage.sync.get(['code'], result => {
  me = result.code;
  chrome.runtime.sendMessage({
    id: 'hi',
    userId: me,
  });
});

const messageInput = document.getElementById('m');

document.getElementById('load_more').onclick = event => loadMore(event);
document.getElementById('userNameId_chat').onclick = event => chooseChat(event);
document.getElementById('sendbutton').onclick = () => send();

messageInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    event.preventDefault();
    send();
  }
});

chrome.runtime.onMessage.addListener(messageReceived);

const port = chrome.runtime.connect();

function messageReceived(msg) {
  console.log(msg);

  switch (msg.id) {
    case 'userList':
      users = msg.userList;
      createUserList(users);
      break;
    case 'messageList':
      const { messageList } = msg;
      for (let i = messageList.length - 1; i >= 0; i--) {
        addMessage(messageList[i]);
      }
      break;
    case 'singleMessage':
      const { message } = msg;
      addOwnMessage(message[0]);
      break;
    case 'connected':
      userConnected(msg.userId);
      break;
    case 'disconnected':
      userDisconnected(msg.userId);
      break;
    default:
      break;
  }
}

const createUserList = userList => {
  const ul = document.getElementById('users-list'),
    chat = document.getElementById('chat-window');

  for (let userid in userList) {
    if (document.getElementById('userNameId' + userid)) {
      continue;
    }
    if (userid === me) continue;

    const { name, connected } = userList[userid];
    const li = document.createElement('li');
    li.className = connected ? 'online' : '';
    li.innerHTML = name;
    li.id = 'userNameId' + userid;
    li.onclick = event => chooseChat(event);
    ul.appendChild(li);

    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatId' + userid;
    chatWindow.className = 'userchat';
    chatWindow.style.display = 'none';
    chatWindow.innerHTML =
      '<h2 style="display: inline;">' +
      name +
      '</h2> <button style="float: right;">Load more</button>' +
      '<ul id="userChatId' +
      userid +
      '"></ul>';
    chatWindow.querySelector('button').onclick = event => loadMore(event);
    chat.appendChild(chatWindow);
  }
};

function userConnected(userId) {
  if (userId === me) {
    return;
  }
  document.getElementById('userNameId' + userId).classList.add('online');
}

function userDisconnected(userId) {
  if (userId === me) {
    return;
  }
  document.getElementById('userNameId' + userId).classList.remove('online');
}

const addMessage = ({ id, message, author, receiver }) => {
  const li = document.createElement('li');
  let date;

  if (id) {
    date = new Date(+id).toLocaleString();
  } else {
    date = new Date().toLocaleString();
  }

  li.innerHTML = users[author].name + ' [' + date + ']: <br>' + message;
  if (receiver === '_chat') {
    document.getElementById('userChatId_chat').prepend(li);
  } else if (author === me) {
    document.getElementById('userChatId' + receiver).prepend(li);
  } else {
    document.getElementById('userChatId' + author).prepend(li);
  }
};

const chooseChat = event => {
  document.querySelector('.selected').classList.remove('selected');
  event.target.classList.add('selected');
  let userId = event.target.id.substr('userNameId'.length);
  Array.from(document.getElementById('chat-window').children).forEach(
    el => (el.style.display = 'none')
  );
  document.getElementById('chatId' + userId).style.display = '';
};

function send() {
  const input = document.getElementById('m'),
    receiver = document
      .querySelector('.selected')
      .id.substr('userNameId'.length),
    message = {
      author: me,
      message: input.value,
      receiver,
    };
  chrome.runtime.sendMessage(message);
  input.value = '';
  input.focus();
  message.id = new Date().getTime();
  addOwnMessage(message);
}

function addOwnMessage({ id, message, author, receiver }) {
  const li = document.createElement('li'),
    date = new Date(+id).toLocaleString();
  li.innerHTML = users[author].name + ' [' + date + ']: <br>' + message;
  if (receiver === '_chat') {
    document.getElementById('userChatId_chat').appendChild(li);
    document
      .getElementById('userChatId_chat')
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else if (author === me) {
    document.getElementById('userChatId' + receiver).appendChild(li);
    document
      .getElementById('userChatId' + receiver)
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  } else {
    document.getElementById('userChatId' + author).appendChild(li);
    document
      .getElementById('userChatId' + author)
      .lastChild.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }
}

function loadMore(event) {
  event.preventDefault();
  const userId = event.target.parentElement.id.substr('chatId'.length),
    message = { id: 'get old', userId };
  chrome.runtime.sendMessage(message);
}
