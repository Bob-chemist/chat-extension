class UsersWindow extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.innerHTML =
            '<div class="user-header">' +
            '  <h2>Чаты</h2>' +
            '</div>' +
            '<div id="users-list" class="users-list"></div>';

        this.usersList = document.getElementById('users-list');
    }

    addUserProfileToList(userProfile) {
        this.usersList.appendChild(userProfile);
    }
}

customElements.define('users-window', UsersWindow);
