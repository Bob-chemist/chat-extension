import '../user-profile/user-profile.js';
import '../users-window/users-window.js';
import '../chat-message/chat-message.js';
import '../chat-window/chat-window.js';
import '../chat-box/chat-box.js';

let users = {};
let me;

const messageInput = document.getElementById('m'),
    // eslint-disable-next-line no-unused-vars
      port = chrome.runtime.connect();

chrome.storage.sync.get([ 'code' ], (result) => {
    me = result.code;

    chrome.runtime.sendMessage({
        id: 'hi',
        userId: me,
    });
});

chrome.runtime.onMessage.addListener(messageReceived);

window.addEventListener('load', () => {
    chrome.storage.sync.get([ 'authorized' ], (result) => {
        if (result.authorized) {
            document.getElementById('sendbutton')
                .onclick = () => send();

            messageInput.addEventListener('keydown', function (event) {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    send();
                }
            });

            messageInput.addEventListener('keyup', function () {
                const receiver = document.querySelector('.selected').id.substr('userNameId'.length),
                      text = messageInput.value;

                localStorage.setItem(receiver, text);
                chrome.runtime.sendMessage({ id: 'typing', receiver });
            });
        } else {
            document.body.innerHTML = '' +
                '<div class=\'info\'>' +
                ' <h3>' +
                '     Перед началом использования расширения, пожалуйста, укажите данные в ' +
                ' </h>' +
                ' <a href=\'../options/options.html\' target=\'_blank\'>настройках</a>' +
                '</div>';
        }
    });
});

function messageReceived(msg) {
    console.log(msg);

    switch (msg.id) {
        case 'userList':
            users = msg.userList;
            createUserList(users);
            break;
        case 'messageList':
            for (let i = 0; i < msg.messageList.length; i++) {
                addMessage(msg.messageList[i]);
            }

            for (const userId in users) {
                const unseenUserMessages = JSON.parse(localStorage.getItem('unseenMessages' + userId));

                if (unseenUserMessages) {
                    document.getElementById('userNameId' + userId);

                    for (let i = 0; i < unseenUserMessages.length; i++) {
                        addMessage(unseenUserMessages[i]);
                    }
                }

            }

            const unseenChatMessages = JSON.parse(localStorage.getItem('unseenMessages_chat'));

            for (let i = 0; i < unseenChatMessages.length; i++) {
                addMessage(unseenChatMessages[i]);
            }

            break;
        case 'singleMessage':
            addMessage(msg.message[0], 'own');
            break;
        case 'connected':
            userConnected(msg.userId);
            break;
        case 'disconnected':
            userDisconnected(msg.userId);
            break;
        case 'typing':
            addTyping(msg.userId);
            break;
    }
}

const createUserList = (userList) => {
    const application = document.getElementById('chat'),
          chatWindow = document.createElement('chat-window'),
          usersWindow = document.createElement('users-window');

    application.appendChild(usersWindow);
    application.appendChild(chatWindow);

    const generalChatBox = document.createElement('chat-box'),
          generalChatProfile = document.createElement('user-profile');

    generalChatBox.initGeneralChatBox();
    generalChatProfile.initGeneralChatProfile();

    chatWindow.addChatBoxToList(generalChatBox);
    usersWindow.addUserProfileToList(generalChatProfile);

    for (const userId in userList) {
        if (userId === me || document.getElementById('userNameId' + userId)) {
            continue;
        }

        const userData = userList[userId],
              profile = document.createElement('user-profile'),
              chatBox = document.createElement('chat-box');

        profile.user = userData;
        chatBox.user = userData;

        chatWindow.addChatBoxToList(chatBox);
        usersWindow.addUserProfileToList(profile);
    }

    const userId = localStorage.getItem('lastChat') ? localStorage.getItem('lastChat') : '_chat',
          node = document.getElementById('userNameId' + userId);

    node.chooseChat({ target: node });
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

const addMessage = ({ id, message, author, receiver }, type = 'default') => {
    const chatMessage = document.createElement('chat-message'),
          date = id
              ? new Date(+id).toLocaleString()
              : new Date().toLocaleString(),
          chatDestination = (receiver === '_chat' || author === me)
              ? receiver
              : author;

    chatMessage.setMessage(users[author], date, message, author === me);
    document.getElementById('chatId' + chatDestination).prepend(chatMessage);

    if (type === 'default') {
        document.getElementById('chatId' + chatDestination).prepend(chatMessage);
    } else {
        document.getElementById('chatId' + chatDestination).appendChild(chatMessage);
        document.getElementById('chatId' + chatDestination)
            .lastChild.scrollIntoView({ block: 'end', behavior: 'smooth' });
    }
};

function send() {
    const input = document.getElementById('m'),
          text = input.value.trim();

    if (text) {
        const receiver = document.querySelector('.selected')
            .id.substr('userNameId'.length),
              message = {
                  id : 'send',
                  author: me,
                  message: text,
                  receiver,
              };

        localStorage.removeItem(receiver);
        chrome.runtime.sendMessage(message);
        message.id = new Date().getTime();
        addMessage(message, 'own');
    }

    input.value = '';
    input.focus();
}

let typingTimeout;

function addTyping(userId) {
    const user_profile = document.getElementById('userNameId' + userId);

    if (!user_profile.classList.contains('typing')) {
        user_profile.classList.add('typing');

        typingTimeout = setTimeout(() => {
            user_profile.classList.remove('typing');
        }, 5000);
    } else {
        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
            user_profile.classList.remove('typing');
        }, 5000);
    }
}
