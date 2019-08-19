document.addEventListener('DOMContentLoaded', function() {
  document.querySelector('button').addEventListener('click', saveCode);

  chrome.storage.sync.get('code', function(data) {
    document.getElementById('code').value = data.code || '';
  });
});

function saveCode() {
  var code = document.getElementById('code').value;

  chrome.storage.sync.set({ code: code }, function() {
    console.log('code is ' + code);
  });
}
