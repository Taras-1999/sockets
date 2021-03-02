const loginModal = new bootstrap.Modal(document.getElementById("login"));
const loginButton = document.querySelector("#login-button");
const sendButton = document.querySelector("#send-button");
const nameInput = document.querySelector("#name-input");
const chatList = document.querySelector("#list");
const messageInput = document.querySelector("#message-input");

let name;
let socket;
let isLoggedIn = false;
const chatItemGeneral =
  '<li class="list-group-item text-center" style="color: red">${text}</li>';
const chatItemPerson = '<li class="list-group-item">${text}</li>';

const makeMsg = (data) => JSON.stringify(data);

const addMessage = (data) => {
  if (data.type === "GENERAL") {
    chatList.innerHTML += chatItemGeneral.replace("${text}", data.message);
  }

  if (data.type === "MESSAGE") {
    chatList.innerHTML += chatItemPerson.replace("${text}", data.message);
  }
};

const connect = () => {
  // Connection opened
  socket = new WebSocket(`ws://localhost:8080`);

  socket.addEventListener("open", function (event) {
    socket.send(
      makeMsg({
        type: "LOGIN",
        name: name,
      })
    );
  });

  // Listen for messages
  socket.addEventListener("message", function (event) {
    const data = JSON.parse(event.data);

    addMessage(data);

    console.log("Message from server ", data);
  });

  socket.addEventListener("close", function (event) {
    console.log("Connection closed ", event.reason);
  });
};

const init = () => {
  loginModal.show();

  loginButton.addEventListener("click", () => {
    name = nameInput.value;

    if (name) {
      isLoggedIn = true;

      fetch("http://localhost:8081/messages")
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          const messages = JSON.parse(data.messages)
          messages.forEach(msg => {
            addMessage(msg)
          });
        });
    }

    loginModal.hide();
    connect();
  });

  sendButton.addEventListener("click", () => {
    const data = {
      name: name,
      type: "MESSAGE",
      message: messageInput.value,
    };

    socket.send(makeMsg(data));

    messageInput.value = "";
  });
};

init();
