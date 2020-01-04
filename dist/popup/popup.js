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
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _user_profile_user_profile_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../user-profile/user-profile.js */ \"./user-profile/user-profile.js\");\n/* harmony import */ var _user_profile_user_profile_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_user_profile_user_profile_js__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var _users_window_users_window_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../users-window/users-window.js */ \"./users-window/users-window.js\");\n/* harmony import */ var _users_window_users_window_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_users_window_users_window_js__WEBPACK_IMPORTED_MODULE_1__);\n\n\nlet users = {};\nlet me;\nconst messageInput = document.getElementById('m'),\n      port = chrome.runtime.connect();\nchrome.storage.sync.get(['code'], result => {\n  me = result.code;\n  chrome.runtime.sendMessage({\n    id: 'hi',\n    userId: me\n  });\n});\nchrome.runtime.onMessage.addListener(messageReceived);\nwindow.addEventListener('load', () => {\n  document.getElementById('load_more').onclick = event => loadMore(event);\n\n  document.getElementById('sendbutton').onclick = () => send();\n\n  messageInput.addEventListener('keydown', function (event) {\n    if (event.key === 'Enter') {\n      event.preventDefault();\n      send();\n    }\n  });\n});\n\nfunction messageReceived(msg) {\n  console.log(msg);\n\n  switch (msg.id) {\n    case 'userList':\n      users = msg.userList;\n      createUserList(users);\n      break;\n\n    case 'messageList':\n      const {\n        messageList\n      } = msg;\n\n      for (let i = 0; i < messageList.length; i++) {\n        addMessage(messageList[i]);\n      }\n\n      break;\n\n    case 'singleMessage':\n      const {\n        message\n      } = msg;\n      addOwnMessage(message[0]);\n      break;\n\n    case 'connected':\n      userConnected(msg.userId);\n      break;\n\n    case 'disconnected':\n      userDisconnected(msg.userId);\n      break;\n  }\n}\n\nconst createUserList = userList => {\n  const application = document.getElementById(\"chat\");\n  const chat = document.getElementById('chat-window');\n  const usersWindow = document.createElement(\"users-window\");\n  application.prepend(usersWindow);\n  const ul = document.getElementById('users-list');\n  let allChat = document.createElement('user-profile');\n  allChat.initGeneralChat();\n  ul.appendChild(allChat);\n\n  for (let userid in userList) {\n    if (document.getElementById('userNameId' + userid)) {\n      continue;\n    }\n\n    if (userid === me) {\n      continue;\n    }\n\n    const {\n      name,\n      connected\n    } = userList[userid],\n          profile = document.createElement('user-profile');\n    profile.user = userList[userid];\n    ul.appendChild(profile);\n    const chatWindow = document.createElement('div');\n    chatWindow.id = 'chatId' + userid;\n    chatWindow.innerHTML = '<h2 style=\"display: inline;\">' + name + '</h2> ' + '<button style=\"float: right;\">Load more</button>' + '<ul id=\"userChatId' + userid + '\"></ul>';\n\n    chatWindow.querySelector('button').onclick = event => loadMore(event);\n\n    chat.appendChild(chatWindow);\n  }\n};\n\nfunction userConnected(userId) {\n  if (userId === me) {\n    return;\n  }\n\n  document.getElementById('userNameId' + userId).classList.add('online');\n}\n\nfunction userDisconnected(userId) {\n  if (userId === me) {\n    return;\n  }\n\n  document.getElementById('userNameId' + userId).classList.remove('online');\n}\n\nconst addMessage = ({\n  id,\n  message,\n  author,\n  receiver\n}) => {\n  const li = document.createElement('li'),\n        date = id ? new Date(+id).toLocaleString() : new Date().toLocaleString(),\n        chatDestination = receiver === '_chat' || author === me ? receiver : author;\n  li.innerHTML = users[author].name + ' [' + date + ']: <br>' + message;\n  document.getElementById('userChatId' + chatDestination).prepend(li);\n};\n\nfunction send() {\n  const input = document.getElementById('m'),\n        text = input.value.trim();\n\n  if (text) {\n    const receiver = document.querySelector('.selected').id.substr('userNameId'.length),\n          message = {\n      author: me,\n      message: text,\n      receiver\n    };\n    chrome.runtime.sendMessage(message);\n    message.id = new Date().getTime();\n    addOwnMessage(message);\n  }\n\n  input.value = '';\n  input.focus();\n}\n\nfunction addOwnMessage({\n  id,\n  message,\n  author,\n  receiver\n}) {\n  const li = document.createElement('li'),\n        date = new Date(+id).toLocaleString(),\n        chatDestination = receiver === '_chat' || author === me ? receiver : author;\n  li.innerHTML = users[author].name + ' [' + date + ']: <br>' + message;\n  document.getElementById('userChatId' + chatDestination).appendChild(li);\n  document.getElementById('userChatId' + chatDestination).lastChild.scrollIntoView({\n    block: 'nearest',\n    behavior: 'smooth'\n  });\n}\n\nfunction loadMore(event) {\n  event.preventDefault();\n  const userId = event.target.parentElement.id.substr('chatId'.length),\n        offset = document.querySelector('.selected-chat-window ul').children.length,\n        message = {\n    id: 'get old',\n    userId,\n    offset\n  };\n  chrome.runtime.sendMessage(message);\n}\n\n//# sourceURL=webpack:///./popup/popup.js?");

/***/ }),

/***/ "./user-profile/user-profile.js":
/*!**************************************!*\
  !*** ./user-profile/user-profile.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class UserProfile extends HTMLElement {\n  constructor() {\n    super();\n    this.root = this.attachShadow({\n      mode: 'open'\n    });\n  }\n\n  initGeneralChat() {\n    this.className = 'selected';\n    this.id = 'userNameId_chat';\n\n    this.onclick = event => UserProfile.chooseChat(event);\n\n    this.root.innerHTML = `All`;\n  }\n\n  set user(user) {\n    this.className = user.connected ? 'online' : '';\n    this.id = 'userNameId' + user.userid;\n\n    this.onclick = event => UserProfile.chooseChat(event);\n\n    this.root.innerHTML = `${user.name}`;\n  }\n\n  static chooseChat(event) {\n    document.querySelector('.selected').classList.remove('selected');\n    event.target.classList.add('selected');\n    const userId = event.target.id.substr('userNameId'.length);\n\n    while (document.getElementsByClassName(\"selected-chat-window\")[0]) {\n      document.getElementsByClassName(\"selected-chat-window\")[0].className = \"\";\n    }\n\n    document.getElementById('chatId' + userId).className = 'selected-chat-window';\n  }\n\n}\n\ncustomElements.define('user-profile', UserProfile);\n\n//# sourceURL=webpack:///./user-profile/user-profile.js?");

/***/ }),

/***/ "./users-window/users-window.js":
/*!**************************************!*\
  !*** ./users-window/users-window.js ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("class UsersWindow extends HTMLElement {\n  constructor() {\n    super();\n  }\n\n  connectedCallback() {\n    this.innerHTML = '<h2>Users</h2>' + '<div id=\"users-list\" class=\"users-list\"></div>';\n  }\n\n}\n\ncustomElements.define('users-window', UsersWindow);\n\n//# sourceURL=webpack:///./users-window/users-window.js?");

/***/ })

/******/ });