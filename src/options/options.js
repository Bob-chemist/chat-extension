document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('button').addEventListener('click', saveCode);

    chrome.storage.sync.get('code', function(data) {
        document.getElementById('code').value = data.code || '';
    });
    chrome.storage.sync.get('ip', function(data) {
        document.getElementById('ip').value = data.ip || '';
    });
});

function messageReceived(msg) {
    if (msg.id === 'authorized') {
        const ip = document.getElementById('ip').value,
              password = document.getElementById('password').value,
              code = document.getElementById('code').value;

        console.log('from options' + msg.authorized);
        chrome.storage.sync.set({ authorized: msg.authorized }, function () {});
        chrome.storage.sync.set({ code: (msg.authorized ? code : '') }, function () {});
        chrome.storage.sync.set({ password: (msg.authorized ? password : '') }, function () {});
        chrome.storage.sync.set({ ip: (msg.authorized ? ip : '') }, function () {});

        document.getElementById('status').innerText = msg.authorized ? 'Saved' : 'Authorisation Error';
    }
}

chrome.runtime.onMessage.addListener(messageReceived);

function saveCode() {
    const code = document.getElementById('code').value,
          password = document.getElementById('password').value,
          newPassword = document.getElementById('new-password').value,
          message = {
              id: 'authentication',
              code,
              password,
              newPassword,
          };

    chrome.runtime.sendMessage(message);
}
