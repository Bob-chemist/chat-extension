class ChatMessage extends HTMLElement {
    constructor() {
        super();
    }

    setMessage(author, date, message, myMessage) {
        this.className = myMessage ? 'out-msg' : 'in-msg';
        this.innerHTML =
            '<div class="header">' +
            '  <div class="author">' +
            '  ' + author.name +
            '  </div>' +
            '  <div class="time">' +
            '  ' + date +
            '  </div>' +
            '</div>' +
            '<div class="message-text">' +
            '' + message +
            '</div>';
    }
}

customElements.define('chat-message', ChatMessage);
