// here all reapeted function to make clean code and easy im tired from write same function
// for now i'll use it with new later i'll make the code clean

const fs = require("fs");

//get all messages;
function GET_MESSAGES() {
  try {
    return JSON.parse(fs.readFileSync(`${__dirname}/data/messages.json`, "utf-8"));
  }
  catch (error) {
    return "function: can't read that file error " + error
  }
}

//get all users
function GET_USERS() {
  try {
    return JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
  }
  catch (error) {
    return "function: can't read that file error " + error
  }
}

//get user using getusers function thats funny
function GET_USER(ID) {
  const users = GET_USERS();
  return users.find(message => message.id === Number(ID));
}

//copy past
function GET_USER_MESSAGE(id) {
  const messages = GET_MESSAGES();
  return messages.find(user => user.id === Number(id));
}


//edit or delete or whatever the finaly is write
function WRITE_MESSAGES(NEW_MESSAGES) {
  try {
    return fs.writeFileSync(`${__dirname}/data/messages.json`, JSON.stringify(NEW_MESSAGES), "utf-8");
  }
  catch (error) {
    return "function: can't write that file error " + error
  }
}


//edit or delete or whatever the finaly is write
function WRITE_USERS(NEW_USERS) {
  try {
    return fs.writeFileSync(`${__dirname}/data/users.json`, JSON.stringify(NEW_USERS), "utf-8");
  }
  catch (error) {
    return "function: can't write that file error " + error
  }
}


//i thought remove full user but i want it flexable
function REMOVE_USER_DATA(ID) {
  const users = GET_USERS();
  users.filter(user => user.id !== Number(ID));
  return WRITE_USERS(users);
}

//remove the message
function REMOVE_USER_MESSAGE(ID) {
  const messages = GET_MESSAGES();
  messages.filter(message => message.id !== Number(ID));
  return WRITE_MESSAGES(messages);
}

//change all use message
// function WRITE_USERS_MESSAGE(ID)


//auth function to fix problem
function authentication(req, res, next){
  //check request
  const $user = req.body.user;
  if(!$user) return res.status(400).send({message: "user object is empty "});

  //check database
  const user = GET_USER($user.id);
  if(!user) return res.status(404).send({message: "user not found"});
  
  //check security
  if($user.email != user.email || $user.password != user.password) return res.status(401).send({message: "email or password not correct"});

  next();
}


module.exports = {GET_MESSAGES, GET_USERS, GET_USER_MESSAGE, GET_USER, WRITE_MESSAGES, WRITE_USERS, REMOVE_USER_DATA, REMOVE_USER_MESSAGE, authentication}