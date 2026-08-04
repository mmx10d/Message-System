const express = require("express");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("Public"));
//convert express to http for socket.io;
const http = require("http").createServer(app);
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["POST", "GET"]
  }
})


//take to login if not login
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/Public/index.html");
});

//login page with signup button
//take the data like cookies
app.get("/api/login", (req, res) => {
  res.sendFile(__dirname + "/Public/pages/login.html");
});


//after signup go to login page
app.get("/api/signup", (req, res) => {
  res.sendFile(__dirname + "/Public/pages/signup.html");
});


//login request
app.post("/api/login", (req, res) => {
  const $email = req.body.email;
  const $password = req.body.password;
  if (!$email) return res.status(400).send("email is empty!");
  if (!$password) return res.status(400).send("password is empty!");

  try {
    const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
    const user = users.find(user => user.email === $email);
    if (user) {
      if (user.email === $email && user.password === $password) {
        return res.send(user) //send the full user the front'll handle it
      }
      else {
        return res.status(400).send("password or email not correct!")
      }
    }
    else {
      return res.status(400).send("user not exist")
    }

  }
  catch (error) {
    return res.status(500).send({ message: "faild read database", error: error });
  }
})


//sign up request
app.post("/api/signup", (req, res) => {
  const $name = req.body.name;
  const $email = req.body.email;
  const $password = req.body.password;

  if (!$email) return res.status(400).send("email is empty!");
  if (!$password) return res.status(400).send("password is empty!");



  //read data from database to get last id;
  //any read data need to JWT or requred be in server only;
  let $lastId;
  let $file;
  try {
    $file = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
    const $user = $file.find(user => user.email === $email);
    if ($user) return res.status(400).send("email is already signup, try login"); // check if email is exit or no;
    if ($file.length > 0) {
      $lastId = $file[$file.length - 1].id
    }
    else {
      $lastId = 0
    }
  }
  catch (error) {
    return res.status(500).send({ message: "faild read database", error: error });
  }


  //add to it default username using id
  //this no secure? mybe but i'll use JWT later.
  if (!$name) name = `user${$lastId}`;

  //push the new user
  $file.push(
    {
      "id": $lastId + 1,
      "name": $name,
      "email": $email, //most add email input for problems
      "password": $password, //use JWT? to hash? mybe
      "photo": "default.png" //for default link
    }
  );
  //create data message for user;
  try {
    const messages = JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`, "utf-8"));
    messages.push({
      "id": $lastId + 1,
      "chats": []
    });
    fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(messages), "utf-8");
  }
  catch (error) {
    console.log("faild to create message database for user" + $lastId + 1);
  }

  //Update Users dataBase in front after update go to login
  try {
    fs.writeFileSync(`${__dirname}/data/users.json`, JSON.stringify($file), "utf-8");
    res.status(200).send("success signup");
  }
  catch (error) {
    return res.status(500).send({ message: "faild write database", error: error });
  }
});

//need data from process in frontend use send localstorage
app.post("/api/chats", (req, res) => {
  //take full body from frontend
  const $user = req.body;

  try {
    //edit make new signup create chat data
    const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
    const messages = JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`, "utf-8"));
    const user = users.find(user => user.id === $user.id);
    const usermessage = messages.find(data => data.id === $user.id); //if not find'll return undifeind
    if (!usermessage) return res.status(400).send("id or user not find");
    if (user.id === $user.id) { //check the information
      //checkt the password and the email for correct data request;
      if (user.email === $user.email && user.password === $user.password) {
        return res.status(200).send(usermessage); //send full data the backend i'll use it
      }
      else {
        return res.status(400).send("email or password request is not match") //user must delete localstorage for securty
      }
    }
    else {
      return res.status(400).send("id or user not find");
    }
  }
  catch (error) {
    return res.status(500).send({ message: "faild to read dataBase", error: error });
  }
});

app.post("/api/photo/upload", (req, res) => {
  const $photo = req.body.photos


  //copy past for time
  // i think i'll change it to function
  const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
  let messages = JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`, "utf-8"));

  //get the user sender
  const user = users.find(user => user.id === $user.id);
  if (!user) return res.status(400).send("message", "user not find") //say to that page is not good;

  //checksecurty if from right user
  //say data not current must the frontend remove the locastorge or logout that use for secury
  if (user.email !== $user.email || user.password !== $user.password) return res.status(400).send("message", "email or password not currect, relogin");

});

//this for find user by id or name;
app.get("/api/find", (req, res) => {
  const $keyword = req.query.keyword;

  //check if send keyword not empty or bad
  if (!$keyword) return res.status(404).send({ message: "search is empty or bad request" });

  try {
    const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, 'utf-8'));
    // convert to number for fix anyproblem
    const findbyid = users.find(user => user.id === Number($keyword));
    // send only photo and name dont want send the email or the password by mistak
    if (findbyid) return res.send({ name: findbyid.name, photo: findbyid.photo, id: findbyid.id });

    //same for problems fix
    const findbyname = users.find(user => user.name == String($keyword));
    if (findbyname) return res.send({ name: findbyname.name, photo: findbyname.photo, id: findbyname.id });
    return res.status(404).send({ message: "the user not exist" });
  }
  catch (error) {
    return res.status(500).send({ message: "faild to read users" });
  }
})


//add empty chat to user with new chats with empty messages
// to recognize the chats in messages
app.post("/api/add", (req, res) => {
  //get full request user data fro secutry
  const $user = req.body.user;
  // get id of the new added required
  const $add = req.body.add;

  if ($user.id == $add) return res.status(409).send({ message: "can't add yourself" });
  try {
    const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`));
    const messages = JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`));
    //get user from data
    const user = users.find(user => user.id == $user.id);
    if (!user) return res.status(404).send({ message: "user data not exit" });

    const message = messages.find(message => message.id == user.id);
    if (!message) return res.status(404).send({ message: "something happen in database, user message not find, need remove that account" })

    //add securty password and email
    if (user.password != $user.password || user.email != $user.email) return res.status(401).send({ message: "user email or password not correct" })

    //get added data from data
    const added_user = users.find(user => user.id == $add);
    if (!added_user) return res.status(404).send({ message: "can't add this user, not exist" });





    const isadded = message.chats.filter(chat => chat.id == $add);
    if (isadded) return res.status(409).send({ message: "this user already added" });

    message.chats.push({
      "id": added_user.id,
      "name": added_user.name,
      "photo": added_user.photo,
      "messages": []
    });

    const newmessages = users.filter(u => u.id !== user.id);
    newmessages.push(message);
    fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(newmessages), 'utf-8');
    res.send({ message: "success added" })
  }
  catch (error) {
    res.status(500).send({ message: "error read data base", error: error })
  }
})

io.on("connection", socket => {
  //edit two chats the sender need check security and want from? to who?
  // {message: "", receiver: id, sender: {id: 0, password: , email,}} for securty
  socket.on("message", data => {
    //get all message to get the wanted message
    try {
      // i think i'll change it to function
      const users = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
      let messages = JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`, "utf-8"));

      //get the user sender
      const sender = users.find(user => user.id === data.sender.id);
      if (!sender) return socket.emit("message", "user sender not find") //say to that page is not good;


      //checksecurty if from right user
      //say data not current must the frontend remove the locastorge or logout that use for secury
      if (sender.email !== data.sender.email || sender.password !== data.sender.password) return socket.emit("message", "email or password not currect, relogin");

      //check if receiver is currect
      const receiver = users.find(user => user.id === data.receiver.id);
      if (!receiver) return socket.emit("message", "receiver user not found");

      //update the data and send the update to al



      //get sender and receiver messages
      const sender_message = messages.find(message => message.id === data.sender.id);
      const receiver_message = messages.find(message => message.id === data.receiver.id);

      //checkt if them right
      if (!sender_message) return socket.emit("message", "sender message not find");
      if (!receiver_message) return socket.emit("message", "receiver message not find");

      //get data of receiver of sender and edit it in the sender
      const sender_data_with_receiver = sender_message.chats.find(chat => chat.id === data.receiver.id);
      //get data of the sender of receiver and edit in the receiver;
      //i think is mybe has error if that first message
      //mybe i'll fix it in front end and use add freinds or something
      const receiver_data_with_sender = receiver_message.chats.find(chat => chat.id === data.sender.id);
      //if not found add new message to reciver or sender to fix probmel
      if (!receiver_data_with_sender) {
        receiver_message.chats.push({
          "id": data.sender.id,
          "name": data.sender.name,
          "photo": data.sender.photo,
          "messages": []
        })
        const update_messages = messages.filter(message => message.id !== data.receiver.id);
        update_messages.push(receiver_message)
        //update and read message again for contintue
        fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(update_messages), "utf-8");
        messages = update_messages;
      }
      if (!sender_data_with_receiver) {
        sender_message.chats.push({
          "id": data.receiver.id,
          "name": data.receiver.name,
          "photo": data.receiver.phto,
          "messages": []
        })
        const update_messages = messages.filter(message => message.id !== data.sender.id);
        update_messages.push(sender_message)
        //update and read message again for contintue
        fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(update_messages), "utf-8");
        messages = update_messages;
      }

      // i'll change the time to make it good later
      // must front end ordening it using the time
      sender_data_with_receiver.messages.push(
        {
          "time": "00:01",
          "sender": "self",
          "content": data.message
        }
      );
      receiver_data_with_sender.messages.push(
        {
          "time": "00:01",
          "sender": "receiver",
          "content": data.message
        }
      );


      //update the data by remove the sender and reciver old and push it again
      //sender data is the new chats
      // filter remove the data of users full;
      const _filtermessagese = messages.filter(message => message.id !== data.sender.id);
      const filteredmessage = _filtermessagese.filter(message => message.id !== data.receiver.id);
      filteredmessage.push({
        "id": data.sender.id,
        "chats": [
          sender_data_with_receiver
        ]
      });

      filteredmessage.push({
        "id": data.receiver.id,
        "chats": [
          receiver_data_with_sender
        ]
      });
      fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(filteredmessage), "utf-8");


      io.emit("message"); //i think i'll make the front end requiest the message every update listen;
    }
    catch (error) {
      console.log("something happen with socket.io: " + error);
    }
  })

  //request the message from socket with password to update it in the server and the socket send the chats for any of chats for users;
})



http.listen(3000, function () {
  console.log("Server run..✅");;
});