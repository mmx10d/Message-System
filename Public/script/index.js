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
const find_pop = document.querySelector(".find_pop");
const find_pop_main = document.querySelector(".find_pop main")
const info_pop = document.querySelector(".info_pop");
const info_pop_main = document.querySelector(".info_pop main");
const info_pop_id = info_pop.querySelectorAll("main span")[0];
const info_pop_name = info_pop.querySelectorAll("main span")[1];
const info_pop_aside = info_pop.querySelector("aside");
const info_pop_photo = info_pop.querySelector("img");
const info_pop_h1 = info_pop.querySelector("h1");

const file = document.querySelector("#file");
const upload = document.querySelector(".uploade");

//for the user self
let user = JSON.parse(localStorage.getItem("user")) || false;
let chats = document.querySelectorAll(".chats");

//auto scroll for if user not scrolling scroll
let autoscroll = true;

//for chatop
let ischatopen = false;

//for now for who send
let lastId;
let lastName;
let lastPhoto;
let lastIdDelete;


//io connection;
const socket = io();

onload = () => {
  footer_name.innerText = user.name;
  footer_photo.src = user.photo;
  main_name.innerText = `Welcome ${user.name.toUpperCase()} !`;
  chats_update();

  //fill data of profile
  info_pop_id.innerHTML = `<b>Id:</b> ${user.id}`
  info_pop_name.innerHTML = `<b>Name:</b> ${user.name}`
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
      //make the user login if found user but not found it in database
      if (!res.chats) { localStorage.removeItem("user"); location.reload };
      if (res.chats.length == 0) return aside_main.innerHTML = "<h1>No chats</h1>";
      aside_main.innerHTML = "";
      for (let i = 0; i < res.chats.length; i++) {
        let _lastMessage;
        let _lastTime;
        if (res.chats[i].messages.length == 0) {
          _lastMessage = "";
          _lastTime = "";
        }
        else {
          _lastMessage = res.chats[i].messages[res.chats[i].messages.length - 1].content;
          _lastTime = res.chats[i].messages[res.chats[i].messages.length - 1].time;
        }
        aside_main.innerHTML += `
      <div class="chats" onclick='open_chat(${res.chats[i].id});activeEffect(this)' oncontextmenu="menu_handle(event, 'chat');lastIdDelete=${res.chats[i].id}">
      <!-- profile photo -->
      <div>
        <img
          src="${res.chats[i].photo}" onerror='this.src = "./icons/default.png"'>
      </div>
      <div>
        <!-- name -->
        <span>${res.chats[i].name}</span>
        <!-- last message content -->
        <span class="lastMessageContent">${_lastMessage}</span>
      </div>
      <!-- time last message -->
      <span class="time">${_lastTime}</span>
    </div>
    `;
      }
    })
    .catch(error => {
      modal("load chats error: " + error);
      // for securty the logut automatic
      setTimeout(() => { location.reload() }, 1500);
    })
}
function open_chat(id) {
  lastId = id;
  ischatopen = true;
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
      const chat = res.chats.find(chat => chat.id == id);
      if (chat) {
        main_chat.innerHTML = "";
        main_header_name.innerText = chat.name;
        lastName = chat.name;
        lastPhoto = chat.photo;
        for (let i = 0; i < chat.messages.length; i++) {
          const message = chat.messages[i];
          main_chat.innerHTML += `
      <div class="${message.sender}" oncontextmenu='menu_handle(event, "message")'>
        <!-- here message content from self -->
        <span>${message.content}</span>
        <!-- time -->
        <span class="time">${message.time}</span>
      </div>
      `;
        }
      }
      chat_scroll();
    })
    .catch(error => {
      modal("open chat error: " + error)
    })
}


function activeEffect(element) {
  chats = document.querySelectorAll(".chats");
  for (let i = 0; i < chats.length; i++) {
    chats[i].classList.remove("active");
  }
  element.classList.add("active");
}


//now use socket.io to send and recieve is real challange lets beggin
function send_message() {
  let data = new Date();
  let hourse = data.getHours();
  let minutes = data.getMinutes();
  let time = `${hourse}:${minutes}`;
  if (!chat_input.value) return;
  if(lastId){open_chat(lastId)}
  socket.emit("message",
    {
      message: chat_input.value,
      time: time,
      receiver: {
        id: lastId,
        name: lastName
      },
      sender: {
        id: user.id,
        password: user.password,
        email: user.email,
        name: user.name
      }
    });
  chat_input.value = "";
}


//cool down for send every 300 ms
let cooldown;
function find_user(keyword) {
  find_pop_main.innerHTML = "search...";
  if (!keyword) return;
  if (cooldown) {
    clearTimeout(cooldown);
  }
  cooldown = setTimeout(() => {
    fetch(`${website}api/find?keyword=${keyword}`)
      .then(res => res.json())
      .then(res => {
        if (!res.message) {
          find_pop_main.innerHTML = `
              <div class="chats" onclick='add_chat(${res.id});activeEffect(this)'>
                <!-- profile photo -->
                <div>
                  <img
                    src="${res.photo}" onerror='this.src = "./icons/default.png"'>
                </div>
                <div>
                  <!-- name -->
                  <span>${res.name}</span>
                </div>
              </div>
    `;
        }
        else {
          find_pop_main.innerHTML = res.message;
        }
      })
  }, 500)
}

//add new users to chats
function add_chat(id) {
  fetch(`${website}api/add`, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      user: user,
      add: id
    })
  })
    .then(res => res.json())
    .then(res => {
      if (res.message == "success added") {
        location.reload();
      }
      else {
        modal(res.message);
      }
    })
    .catch(err => {
      modal(err);
    })
}

function show_my_info() {
  info_pop_aside.style.display = "";
  info_pop_main.innerHTML = `
        <!-- show photo -->
        <header>
          <h1>My Information</h1>
        </header>
        <main>
          <!-- show when click hide and can edit and show ok button or edit page -->
          <img src="#" alt="profile photo" onerror="this.src='icons/default.png'">
          <span><b>Id:</b> ${user.id}</span>
          <span><b>Name:</b> ${user.name}</span>
        </main>
  `;
  info_pop.showModal();
}


function change_info_to_public(id = user.id, name = user.name, photo = user.phto) {
  info_pop_aside.style.display = "";
  let info_pop_h1_text = "My information";
  if (id != user.id) info_pop_h1_text = `${name.toUpperCase()} informations`;
  info_pop_main.innerHTML = `
        <!-- show photo -->
        <header>
          <h1>${info_pop_h1_text}</h1>
        </header>
        <main>
          <!-- show when click hide and can edit and show ok button or edit page -->
          <img src="${photo}" alt="profile photo" onerror="this.src='icons/default.png'">
          <span><b>Id:</b> ${id}</span>
          <span><b>Name:</b> ${name}</span>
        </main>
  `;
}

function change_info_to_account() {
  info_pop_aside.style.display = "";
  info_pop_main.innerHTML = `
          <!-- show when click hide and can edit and show ok button or edit page -->
          <img src="#" alt="profile photo" onerror="this.src='icons/default.png'">
          <div>
            <span>Id:</b> ${user.id}</span>
            <button>
              <img src="icons/edit.png">
            </button>
          </div>
          <div>
            <input type="text" value="${user.name}">
            <button>
              <img src="icons/check.png">
            </button>
          </div>
          <div>
            <input type="text" value="${user.email}">
            <button>
              <img src="icons/check.png">
            </button>
          </div>
          <div>
            <input type="text" value="${"*".repeat(user.password.length)}">
            <button>
              <img src="icons/check.png">
            </button>
          </div>
        `;
}


//update message
// i think here i'll be problem if the server has loot of people but i dont care im only maxim 3 person
socket.on("message", () => {
  chats_update();
  chat_scroll();
  if(ischatopen){
    open_chat(lastId)
  }
})


//width autoscroll varaible i can do some good shapes
function chat_scroll() {
  if (autoscroll) {
    main_chat.scrollTo(0, main_chat.scrollHeight);
  }
}


function show_chat_info() {
  change_info_to_public(lastId, lastName, lastPhoto);
  info_pop_aside.style.display = "none";
  info_pop.showModal();
}


//create the menu at the mouse if chat or message status hide or show
let drop_menu = document.querySelector('.drop_menu');
function menu(x, y, type = "chat", status = true) {
  if (!drop_menu) {
    document.body.innerHTML += `
    <div class="drop_menu">
      <button>
        DELETE
      </button>
    </div>
    `;
    drop_menu = document.querySelector('.drop_menu');
  }
  else {
    if (type == "chat") drop_menu.querySelector("button").onmousedown = _ => delete_chat();
    else if (type == "message") drop_menu.querySelector("button").onmousedown = _ => delete_message();
  }
  drop_menu.style.cssText = `
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    border-radius: var(--radius--);
    padding: 10px;
    position: absolute;
    left: ${x}px;
    top: ${y}px;
    font-size: large;
    box-shadow: var(--shadow_outside--);
    cursor: pointer;
  `;
  let buttons = drop_menu.querySelectorAll("button")
  for (let i = 0; i < buttons.length; i++) {
    btn = buttons[i];
    btn.style.cssText = `
      cursor: pointer;
      padding: 15px;
      box-sizing: border-box;
      border: solid 1px black;
      border-radius: var(--radius--);
      background: red;
      color: white
    `;
  }
  if (status) {
    drop_menu.style.display = ""
  }
  else {
    drop_menu.style.display = "none"
  }
}


document.addEventListener("click", () => {
  if (drop_menu) {
    menu(0, 0, "", false)
  }
});


document.addEventListener("keypress", e => {
  if (e.code == "Enter") {
    send_message();
  }
})

function menu_handle(e, type) {
  e.preventDefault()
  const x = e.clientX;
  const y = e.clientY;
  menu(x, y, type, true);
}

async function delete_chat() {
  // i dont think it need check the message only delete and reload
  post_request_user_with_lastIdDelete("api/delete/chat");
  location.reload();
}

//generate new message id ohh shit more work but ok little bit to finish or make it in laste with block feature
//no i'll remove it by length its safe if other user send new message that mean length be large but the number still it
function delete_message(id) {

}


//to shortcut the function and request for now i'll use it then clean the code
//use data reflex use like id like whatever
//like /api/chats
//use post_request_user_with_lastIdDelete('api/chats')
function post_request_user_with_lastIdDelete(endpoint) {
  fetch(website + endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      user: user,
      "target": lastIdDelete
    })
  })
    .then(res => res.json())
    .then(res => {
      return res;
    })
    .catch(error => {
      return error;
    })
}

//socket.io must be here or no i'll check // yeah first step i finished


// //update photo by using extrenal website
// file.onchange = () => {
//   //need loot of code i'll back later


//   //close
//   upload.close();
// }