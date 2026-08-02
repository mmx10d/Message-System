const express = require("express");
const io = require("socket.io");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(express.static("Public"));
//convert express to http for socket.io;
const http = require("http").createServer(app);


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
    const $file = JSON.parse(fs.readFileSync(`${__dirname}/data/users.json`, "utf-8"));
    const $user = $file.find(user => user.email === $email);
    if ($user.email === $email) {
      if ($user.password === $password) {
        return res.status(200).send($user); //send all data the fronend handle it
      } else {
        return res.status(400).send("invalid password");
      }
    } else {
      return res.status(400).send("email not exit");
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
    $lastId = $file[$file.length - 1].id;
  }
  catch (error) {
    return res.status(500).send({ message: "faild read database", error: error });
  }


  //add to it default username using id
  //this no secure? mybe but i'll use JWT later.
  if (!$password) name = `user${$lastId}`;

  //push the new user
  $file.push(
    {
      "id": $lastId + 1,
      "name": $name,
      "email": $email, //most add email input for problems
      "password": $password //use JWT? to hash? mybe
    }
  );

  //Update Users dataBase in front after update go to login
  try {
    fs.writeFileSync(`${__dirname}/data/users.json`, JSON.stringify($file), "utf-8");
    return res.status(200).send("success signup");
  }
  catch (error) {
    return res.status(500).send({ message: "faild write database", error: error });
  }
});


http.listen(3000, function () {
  console.log("Server run..✅");;
});