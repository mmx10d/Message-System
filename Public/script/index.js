// const modal = document.querySelector("dialog");
const name = document.querySelector("#user_name");
const website = location.href; //for be dynamic request
const main_chat = document.querySelector("main main");
const main_header = document.querySelector("main header");
const main_header_name = document.querySelector("main header span")
const main_name = document.querySelector("main main h1");
const footer = document.querySelector("footer");
const chat_input = document.querySelector("footer input");
const aside_main = document.querySelector("aside main");
const footer_name = document.querySelector("footer #user_name")
const footer_photo = document.querySelector(".profile img")
const pop = document.querySelector("dialog");

const file = document.querySelector("#file");
const upload = document.querySelector(".uploade");

//for the user self
let user = JSON.parse(localStorage.getItem("user")) || false;

//for now for who send
let lastId;
let lastName;


//io connection;
const socket = io();

onload = () => {
  footer_name.innerText = user.name;
  footer_photo.src = user.photo;
  main_name.innerText += ` ${user.name} !`;
  chats_update();
}

function modal(message = "add message") {
  pop.querySelector("span").innerText = message;
  pop.showModal();
}

function chats_update() {
  fetch(`${website}api/chats`, {
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

      if (res.chats.length === 0) return aside_main.innerHTML = "<h1>No chats</h1>";
      for (let i = 0; i < res.chats.length; i++) {
        let _lastMessage;
        let _lastTime;
        if (res.chats[i].messages.length === 0) {
          _lastMessage = "";
          _lastTime = "";
        }
        else {
          _lastMessage = res.chats[i].messages[res.chats[i].messages.length - 1].content;
          _lastTime = res.chats[i].messages[res.chats[i].messages.length - 1].time;
        }
        aside_main.innerHTML += `
      <div class="chats" onclick='open_chat(${res.chats[i].id})'>
      <!-- profile photo -->
      <div>
        <img
          src="${res.chats[i].photo}" onerror='this.src = "./icons/default.png"'>
      </div>
      <div>
        <!-- name -->
        <span>${res.chats[i].name}</span>
        <!-- last message content -->
        <span>${_lastMessage}</span>
      </div>
      <!-- time last message -->
      <span>${_lastTime}</span>
    </div>
    `;
      }
    })
    .catch(error => {
      modal("load chats error: " + error)
    })
}
function open_chat(id) {
  lastId = id;
  fetch(`${website}api/chats`, {
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
      main_header.style.display = "";
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
    .catch(error => {
      modal("open chat error: " + error)
    })
}



//now use socket.io to send and recieve is real challange lets beggin
function send_message() {
  if (!chat_input) return;
  socket.emit("message", { message: chat_input.value, receiver: { id: lastId, name: lastName }, sender: { id: user.id, password: user.password, email: user.email, name: user.name } });
  chat_input.value = "";
}

//update message
// i think here i'll be problem if the server has loot of people but i dont care im only maxim 3 person
socket.on("message", () => {
  open_chat(lastId);
})


//socket.io must be here or no i'll check // yeah first step i finished


// //update photo by using extrenal website
// file.onchange = () => {
//   //need loot of code i'll back later


//   //close
//   upload.close();
// }