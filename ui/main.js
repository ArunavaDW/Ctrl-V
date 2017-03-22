var create_account_btn = document.getElementById('create_account_form_submit');
var login_btn = document.getElementById('login_btn');
var loader = document.getElementsByClassName('loader');



console.log("fgfdgdf");

login_btn.onclick = function() {
    
    loader[1].style.display = "inline-block";
    
    var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readystate === XMLHttpRequest.DONE){
      if(request.status === 200){
          alert("Logged In!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
      }
    }
  };

  var username = document.getElementById('the_uname_login').value;
  var password  = document.getElementById('the_passwd_login').value;

  console.log(password);
  console.log(username);

  request.open('POST', 'http://arunavadw.imad.hasura-app.io/login', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: username,
                              password: password}));
};


create_account_btn.onclick = function() {
  
  loader[0].style.display = "inline-block";
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readystate === XMLHttpRequest.DONE){
      if(request.status === 200){
          alert("Account Created Successfully!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
      }
    }
  };

  var firstName = document.getElementById('fname_create').value;
  var lastName  = document.getElementById('lname_create').value;
  var mailAddr  = document.getElementById('email_create').value;
  var password  = document.getElementById('pwd_create').value;
  var userName  = document.getElementById('uname').value;
  console.log(password);
  console.log(userName);
  console.log('3434');
  request.open('POST', 'http://arunavadw.imad.hasura-app.io/create_account', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({username: userName,
                              firstname: firstName,
                              lastname: lastName,
                              email: mailAddr,
                              password: password}));
};
