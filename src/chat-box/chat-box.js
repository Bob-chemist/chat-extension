class ChatBox extends HTMLElement {
    constructor() {
        super();
    }

    initGeneralChatBox() {
        this.chatName = 'Общий чат';
        this.chatId = '_chat';

        this.className = 'chat-container selected-chat-window';
        this.id = 'chatId_chat';
    }

    set user(user) {
        this.chatName = user.name;
        this.chatId = user.userid;

        this.className = 'chat-container';
        this.id = 'chatId' + user.userid;
    }
}

customElements.define('chat-box', ChatBox);
