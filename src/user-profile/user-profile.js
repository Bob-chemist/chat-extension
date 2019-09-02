class UserProfile extends HTMLElement {
    constructor() {
        super();
        this.root = this.attachShadow({ mode: 'open' });
    }

    initGeneralChatProfile() {
        this.id = 'userNameId_chat';
        this.className = 'selected';
        this.onclick = (event) => this.chooseChat(event);
        this.root.innerHTML =
      'Общий чат';
    }

    set user(user) {
        this.id = 'userNameId' + user.userid;
        this.className = user.connected ? 'online' : '';
        this.onclick = (event) => this.chooseChat(event);
        this.root.innerHTML =
      `${user.name}`;
    }

    setReadHistory(chatId) {
        const limit = document.getElementById('chatId' + chatId).childNodes.length;

        chrome.runtime.sendMessage({ id: 'set read history', chatId, limit });
    }

    chooseChat(event) {
        const userId = event.target.id.substr('userNameId'.length),
              chosenChatBox = document.getElementById('chatId' + userId),
              closedChatId = document.querySelector('.selected').id.substr('userNameId'.length);

        this.setReadHistory(closedChatId);

        chrome.runtime.sendMessage({ id: 'update history' });

        document.querySelector('.selected').classList.remove('selected');
        event.target.classList.add('selected');

        localStorage.setItem('lastChat', userId);
        document.getElementById('m').value = localStorage.getItem(userId) ? localStorage.getItem(userId) : '';

        while (document.getElementsByClassName('selected-chat-window')[0]) {
            document.getElementsByClassName('selected-chat-window')[0].className = '';
        }

        chosenChatBox.className = 'selected-chat-window';

        document.getElementById('chat-header-text').innerHTML = chosenChatBox.chatName;
        document.getElementById('load_more').setAttribute('data-chat-id', chosenChatBox.chatId);
    }

    setUnseenMessages(num) {

    }
}

customElements.define('user-profile', UserProfile);
