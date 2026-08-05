// this for check the user and return him to correct page


//check if not login go to login page
//get data from localstorage
//false mean not login
user = JSON.parse(localStorage.getItem("user")) || false;
if (user) {
  if (location.pathname == "/api/login" || location.pathname == "/api/signup") { //thats mean already him login in
    location.pathname = "/";
  }
}
else {
  if (location.pathname == "/") {
    location.pathname = "/api/login";
  }
}