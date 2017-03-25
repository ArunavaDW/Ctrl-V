var theDp = document.getElementById('theProfilePicture');
var theDpLink = document.getElementById('dpLink');
var editSaveBtn = document.getElementById('editProfileSave');
var loader = document.getElementsByClassName('loader');

function loadTheImage(){
  proPicLink = theDpLink.value;
  if(proPicLink !== ""){
      theDp.src = theDpLink.value;
  } else {
      theDp.src = '/ui/blank-profile-picture.png';
  }
}

editSaveBtn.onclick = function() {
  loader[0].style.display = "inline-block";
  
  var request = new XMLHttpRequest();

  request.onreadystatechange = function() {

    if(request.readyState === XMLHttpRequest.DONE){
      if(request.status === 200){
          alert("Changes Saved!");
      } else {
        alert("Some Internal Error Occured!\nPlease Try Again Later!");
      }
    }
  };
  
  var dpLink = theDpLink.value;
  var bio  = document.getElementById('theBioArea').value;
  
  if(dpLink === ""){
      dpLink = null;
  }
  
  request.open('POST', 'http://arunavadw.imad.hasura-app.io/edit-profile-save', true);
  request.setRequestHeader('Content-Type', 'application/json');
  request.send(JSON.stringify({DpLink: dpLink,
                               Bio:    bio}));
};