// const modal = document.querySelector("dialog");
const name = document.querySelector("#user_name");
const hostname = "http://localhost:3000";
const main_chat = document.querySelector("main main");
const main_header = document.querySelector("main header");
const main_header_name = document.querySelector("main header span")
const footer = document.querySelector("footer");
const chat_input = document.querySelector("footer input");
const aside = document.querySelector("aside");

//for the user self
let user;

//for now for who send
let lastId;
let lastName;


//io connection;
const socket = io();


//check if not login go to login page
onload = () => {
  //get data from localstorage
  //false mean not login
  user = JSON.parse(localStorage.getItem("user")) || false;
  if (user) {
    name.innerText = user.name;
  }
  else {
    location.pathname = "/api/login";
  }

  chats_update();

}

function chats_update() {
  fetch(`${hostname}/api/chats`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      "id": user.id,
      "email": user.email,
      "password": user.password
    })
  })
    .then(res => res.json())
    //add new chats
    .then(res => {
      for (let i = 0; i < res.chats.length; i++) {
        aside.innerHTML += `
      <div class="chats" onclick='open_chat(${res.chats[i].id})'>
      <!-- profile photo -->
      <div>
        <img
          src="${"#"}">
      </div>
      <div>
        <!-- name -->
        <span>${res.chats[i].name}</span>
        <!-- last message content -->
        <span>${res.chats[i].messages[res.chats[i].messages.length - 1].content}</span>
      </div>
      <!-- time last message -->
      <span>${res.chats[i].messages[res.chats[i].messages.length - 1].time}</span>
    </div>
    `;
      }

    })
}
function open_chat(id) {
  lastId = id;
  fetch(`${hostname}/api/chats`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      "id": user.id,
      "email": user.email,
      "password": user.password
    })
  })
    .then(res => res.json())
    .then(res => {
      //show the send input
      footer.style.display = "";
      //search on target chat by id
      const chat = res.chats.find(chat => chat.id === id);
      main_chat.innerHTML = "";
      main_header_name.innerText = chat.name;
      lastName = chat.name;
      for (let i = 0; i < chat.messages.length; i++) {
        const message = chat.messages[i];
        main_chat.innerHTML += `
      <div class="${message.sender}">
        <!-- here message content from self -->
        <span>${message.content}</span>
        <!-- time -->
        <span>${message.time}</span>
      </div>
      `;
      }
    })
}



//now use socket.io to send and recieve is real challange lets beggin
function send_message() {
  if (!chat_input) return;
  socket.emit("message", { message: chat_input.value, receiver: {id: lastId, name: lastName}, sender: { id: user.id, password: user.password, email: user.email, name: user.name } });
  socket.on("message", data => {
    console.log(data)
  })
}

//update message
// i think here i'll be problem if the server has loot of people but i dont care im only maxim 3 person
socket.on("message", () => {
  console.log("recive new message")
})


//socket.io must be here or no i'll check // yeah first step i finished


