// const modal = document.querySelector("dialog");
const name = document.querySelector("#user_name");
const host = "http://localhost:3000";
const main_chat = document.querySelector("main main");
const aside = document.querySelector("aside");
let user;

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
  fetch(`${host}/api/chats`, {
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
  fetch(`${host}/api/chats`, {
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
    //search on target chat by id
    const chat = res.chats.find(chat => chat.id === id);
    main_chat.innerHTML = "";
    for(let i = 0; i < chat.messages.length; i++){
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
//socket.io must be here or no i'll check

