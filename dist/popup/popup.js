/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./popup/popup.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./popup/popup.js":
/*!************************!*\
  !*** ./popup/popup.js ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("let users = {};\nlet me;\nchrome.storage.sync.get(['code'], result => {\n  me = result.code;\n});\nconst messageInput = document.getElementById('m');\n\ndocument.getElementById('userNameId_chat').onclick = event => chooseChat(event);\n\ndocument.getElementById('sendbutton').onclick = () => send();\n\nmessageInput.addEventListener('keydown', function (event) {\n  if (event.key === 'Enter') {\n    event.preventDefault();\n    send();\n  }\n});\nvar port = chrome.runtime.connect({\n  name: 'Sample Communication'\n});\nport.postMessage('Hi BackGround'); //for listening any message which comes from runtime\n\nport.onMessage.addListener(function (msg) {\n  console.log(msg);\n\n  switch (msg.id) {\n    case 'userList':\n      users = msg.userList;\n      createUserList(users);\n      break;\n\n    case 'messageList':\n      const {\n        messageList\n      } = msg;\n      messageList.forEach(message => addMessage(message));\n      break;\n\n    case 'connected':\n      userConnected(msg.userId);\n      break;\n\n    case 'disconnected':\n      userDisconnected(msg.userId);\n      break;\n\n    default:\n      break;\n  }\n});\n\nconst createUserList = userList => {\n  const ul = document.getElementById('users-list'),\n        chat = document.getElementById('chat-window');\n\n  for (let userid in userList) {\n    if (document.getElementById('userNameId' + userid)) {\n      continue;\n    }\n\n    if (userid === me) continue;\n    const {\n      name,\n      connected\n    } = userList[userid];\n    const li = document.createElement('li');\n    li.className = connected ? 'online' : '';\n    li.innerHTML = name;\n    li.id = 'userNameId' + userid;\n\n    li.onclick = event => chooseChat(event);\n\n    ul.appendChild(li);\n    const chatWindow = document.createElement('div');\n    chatWindow.id = 'chatId' + userid;\n    chatWindow.className = 'userchat';\n    chatWindow.style.display = 'none';\n    chatWindow.innerHTML = '' + '<h2>' + '' + name + '</h2>' + '<ul id=\"userChatId' + userid + '\"></ul>';\n    chat.appendChild(chatWindow);\n  }\n};\n\nfunction userConnected(userId) {\n  if (userId === me) {\n    return;\n  }\n\n  document.getElementById('userNameId' + userId).classList.add('online');\n}\n\nfunction userDisconnected(userId) {\n  if (userId === me) {\n    return;\n  }\n\n  document.getElementById('userNameId' + userId).classList.remove('online');\n}\n\nconst addMessage = ({\n  id,\n  message,\n  author,\n  receiver\n}) => {\n  const li = document.createElement('li');\n  let date;\n\n  if (id) {\n    date = new Date(+id).toLocaleString();\n  } else {\n    date = new Date().toLocaleString();\n  }\n\n  li.innerHTML = users[author].name + ' [' + date + ']: <br>' + message;\n\n  if (receiver === '_chat') {\n    document.getElementById('userChatId_chat').appendChild(li);\n    document.getElementById('userChatId_chat').lastChild.scrollIntoView({\n      block: 'nearest',\n      behavior: 'smooth'\n    });\n  } else if (author === me) {\n    document.getElementById('userChatId' + receiver).appendChild(li);\n    document.getElementById('userChatId' + receiver).lastChild.scrollIntoView({\n      block: 'nearest',\n      behavior: 'smooth'\n    });\n  } else {\n    document.getElementById('userChatId' + author).appendChild(li);\n    document.getElementById('userChatId' + author).lastChild.scrollIntoView({\n      block: 'nearest',\n      behavior: 'smooth'\n    });\n  }\n};\n\nconst chooseChat = event => {\n  document.querySelector('.selected').classList.remove('selected');\n  event.target.classList.add('selected');\n  let userId = event.target.id.substr('userNameId'.length);\n  Array.from(document.getElementById('chat-window').children).forEach(el => el.style.display = 'none');\n  document.getElementById('chatId' + userId).style.display = '';\n};\n\nfunction send() {\n  const input = document.getElementById('m'),\n        receiver = document.querySelector('.selected').id.substr('userNameId'.length),\n        message = {\n    author: me,\n    message: input.value,\n    receiver\n  };\n  port.postMessage(message);\n  input.value = '';\n  input.focus();\n  message.id = new Date().getTime();\n  addMessage(message);\n}\n\n//# sourceURL=webpack:///./popup/popup.js?");

/***/ })

/******/ });