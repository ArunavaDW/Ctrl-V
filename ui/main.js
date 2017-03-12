var create_account_btn = document.getElementById('create_account_form_submit');
console.log("sdsds");
create_account_btn.onclick = function() {

  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readystate === XMLHttpRequest.DONE){
      if(request.status === 200){
          alert("Account Created Successfully!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
      }
    }
  }

  var firstName = document.getElementById('fname_create').value;
  var lastName  = document.getElementById('lname_create').value;
  var mailAddr  = document.getElementById('email_create').value;
  var password  = document.getElementById('pwd_create').value;
  console.log(password);
  request.open('POST', 'db.imad.hasura-app.io/create_account', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.strigify({username: username,
                              firstname: firstName,
                              lastname: lastName,
                                email: mailAddr,
                                password: password}));
}
