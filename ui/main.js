var create_account_btn = document.getElementById('create_account_form_submit');
var create_paste_btn = document.getElementById('create_paste_submit');

console.log(create_account_btn);
console.log(create_paste_btn);

create_paste_btn.onclick = function() {
  var request = new XMLHttpRequest();
  request.onreadystatechange = function() {

    if(request.readystate === XMLHttpRequest.DONE){
      if(request.status === 200){
          alert("Paste Created Successfully!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
      }
    }
  };

  var pasteBody = document.getElementById('main_paste').value;
  var pasteTitle = document.getElementById('paste_title').value;
  var pasteAuthor = document.getElementById('paste_as').value;
  var pasteTime = new Date();

  request.open('POST', 'http://arunavadw.imad.hasura-app.io/create_paste', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({PasteBody: pasteBody,
                              PasteTitle: pasteTitle,
                              PasteAuthor: pasteAuthor,
                              PasteTime:   pasteTime}));
};

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
