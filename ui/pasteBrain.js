
var create_paste_btn = document.getElementById('create_paste_submit');
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
  
  console.log(pasteTime);

  request.open('POST', 'http://arunavadw.imad.hasura-app.io/create-paste', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({PasteBody: pasteBody,
                              PasteTitle: pasteTitle,
                              PasteAuthor: pasteAuthor,
                              PasteTime:   pasteTime}));
};
