document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', saveCode);

  chrome.storage.sync.get('code', function(data) {
    document.getElementById('code').value = data.code || '';
  });
  chrome.storage.sync.get('ip', function(data) {
    document.getElementById('ip').value = data.ip || '';
  });
});

function saveCode() {
  const code = document.getElementById('code').value,
    ip = document.getElementById('ip').value;

  chrome.storage.sync.set({ code: code }, function() {
    console.log('Code is ' + code);
  });
  chrome.storage.sync.set({ ip: ip }, function() {
    console.log('Server is ' + ip);
  });
}
