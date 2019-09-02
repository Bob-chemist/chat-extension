class ChatWindow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML =
            '<div class="chat-header">' +
            '  <h2 id="chat-header-text">Общий чат</h2>' +
            '  <button id="load_more" data-chat-id="_chat">Больше</button>' +
            '</div>' +
            '<div id="chat-boxes-list" class="chat-boxes-list"></div>';

        document.getElementById('load_more').onclick = (event) => this.loadMore(event);
        this.chatboxList = document.getElementById('chat-boxes-list');
    }

    loadMore(event) {
        event.preventDefault();

        const userId = event.target.dataset.chatId,
              offset = this.querySelector('.selected-chat-window').children.length,
              message = { id: 'get old', userId, offset };

        chrome.runtime.sendMessage(message);
    }

    addChatBoxToList(chatBox) {
        this.chatboxList.appendChild(chatBox);
    }
}

customElements.define('chat-window', ChatWindow);
