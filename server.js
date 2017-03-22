var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');


// Global Variables
var LoggedIn = false;
var LoginBlock = `
<div id="loginBlock">
      <div class="the_footer_login_box">
        <div class="justBoxIt">
          <div>
            <img id="theBlankProPic" src="/ui/blank-profile-picture.png" alt="Blank Profile Picture" height="100" width="100" />
          </div>
          <div>
            <h4>Hello Guest</h4>
          </div>
          <div>
            <div>
              <button id="" type="submit" onclick="document.getElementById('create_account_form')
              .style.display='block'">Sign Up</button>
            </div>
            <div>
              <button id="" type="submit" onclick="document.getElementById('login_form')
              .style.display='block'">Sign In</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- The Create Account form -->
    <div id="create_account_form" class="modal_form">
      <div class="the_login_box the_box animate">
          <span onclick="document.getElementById('create_account_form')
          .style.display='none'" class="theCloseButton"
          title="Close">&times;</span>
          <div class="create_account_box">
            <label><b>First Name<sup>*</sup></b></label>
            <input type="text" id="fname_create" placeholder="First Name" name="fname"
             required autofocus>
            <label><b>Last Name</b></label>
            <input type="text" id="lname_create" placeholder="Last Name" name="lname">
            <br/><br/><br/><br/>
            <label><b>Email<sup>*</sup></b></label>
            <input type="email" id="email_create" placeholder="Email" name="elec-mail" required>
            <label class="label_uname_padding"><b>Username<sup>*</sup></b></label>
            <input type="text" id="uname" placeholder="Username" name="u_name" required>
            <br/><br/><br/><br/>
            <label class="label_passwd_padding"><b>Password<sup>*</sup></b></label>
            <input type="password" id="pwd_create" placeholder="Password" name="passwd" required>
            <br/><br/><br/><br/>
            <label><b>Confirm Password<sup>*</sup></b></label>
            <input type="password" placeholder="Re-Type Password" name="c_passwd" required>
             <br/><br/><br/><br/>
            <hr/>
            <button id="create_account_form_submit" type="submit">Create New Account</button>
          </div>
      </div>
    </div>

    <!-- The Login form -->
    <div id="login_form" class="modal_form">
      <div class="animate the_box the_login_box">
        <span onclick="document.getElementById('login_form')
        .style.display='none'" class="theCloseButton"
        title="Close">&times;</span>
        <form method="post" action="/login">
          <div class="create_account_box">
            <label><b>Username</b></label>
            <input type="text" placeholder="Username" name="uname" required>
            <br/><br/>
            <label><b>Password</b></label>
            <input type="password" placeholder="Password" name="p_asswd" required>
            <br/><br/>
            <hr/>
            <button type="submit">Login</button>
          </div>
        </form>
      </div>
    </div>
  </div>
`;

var config = {
    user: 'arunavadw',
    database: 'arunavadw',
    host: 'db.imad.hasura-app.io',
    port: '5432',
    password: process.env.DB_PASSWORD
};

var app = express();
app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(session({
    secret: 'someRandomSecretValue',
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30}
}));

app.set("views", path.resolve(__dirname, "ui/views"));
app.set("view engine", "ejs");

var pool = new Pool(config);

app.use(function(req, res, next) {
    if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       LoggedIn = true;
       
   }
   next();
});

app.get('/ctrlVUsers-db', function (req, res) {
  
  pool.query('SELECT * FROM ctrlvusers', function(err, result){
      if (err) {res.status(500).send(err.toString());}
      else {res.send(result);}
  });
  
});

app.get('/', function (req, res) {
    
    console.log('We are here');
    if (req.session && req.session.auth && req.session.auth.userId) {
       
       pool.query('SELECT * FROM "ctrlvusers" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(createProfileTemplate(result.rows[0]));
           }
       });
       
   } else {
       res.sendFile(path.join(__dirname, 'ui', 'index.html'));
   }
  
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

app.get('/pastes/:pasteLink', function (req, res) {
  pool.query('SELECT * FROM "pastes" WHERE paste_link = $1', [req.params.pasteLink], function(err, result){
      
      if (err) {
          res.status(500).send(err.toString());
        } else {
              if (result.rows.length === 0) {
                  res.status(403).send(errorTemplate("Paste Link Invalid!"));
              } else {
                  res.end(createPasteTemplate(result.rows[0]));
              }
              }
        
  });
});

app.get('/NewPaste', function(req, res) {
   res.send(thePastePage()); 
});

app.get('/browse', function(req, res){
   pool.query('SELECT * FROM "pastes" ORDER BY id DESC', function(err, response){
      if(err){
          res.status(500).end(err.toString());
      } else {
          if (response.rows.length === 0) {
            res.status(403).end(errorTemplate("No Pastes Made!"));
            } else {
                res.end(createBrowsePage(response));
            }
      }
   });
});

app.get('pastes/bower_components/css-ripple-effect/dist/ripple.min.css', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'bower_components', 'css-ripple-effect', 'dist', 'ripple.min.css'));
});

app.get('bower_components/css-ripple-effect/dist/ripple.min.css', function(req, res){
    res.sendFile(path.join(__dirname, 'ui', 'bower_components', 'css-ripple-effect', 'dist', 'ripple.min.css'));
});

app.post('/login', function(req, res){
    
    var username = req.body.username;
    var password = req.body.password;
    
    pool.query('SELECT * FROM "ctrlvusers" WHERE "username" = $1', [username], function(err, result) {
        
        if (err) {
          res.status(500).send(err.toString());
        } else {
              if (result.rows.length === 0) {
                  res.status(403).send('username/password is invalid');
              } else {
                  // Match the password
                  var dbString = result.rows[0].password;
                  var salt = dbString.split('$')[2];
                  var hashedPassword = hash(password, salt); // Creating a hash based on the password submitted and the original salt
                  if (hashedPassword === dbString) {
                    
                    // Set the session
                    req.session.auth = {userId: result.rows[0].id, userName: result.rows[0].username};
                    // set cookie with a session id
                    // internally, on the server side, it maps the session id to an object
                    // { auth: {userId }}
                    
                    res.redirect('/');
                    
                  } else {
                      res.end(errorTemplate("Username/Password Invalid!"));
                  }
              }
        }
});
});

app.get('/logout', function (req, res) {
   delete req.session.auth;
   LoggedIn = false;
   res.end(errorTemplate("You are now Logged out!\nHope to See you Soon!"));
});


app.get('/check-login', function (req, res) {
   if (req.session && req.session.auth && req.session.auth.userId) {
       // Load the user object
       pool.query('SELECT * FROM "ctrlvusers" WHERE id = $1', [req.session.auth.userId], function (err, result) {
           if (err) {
              res.status(500).send(err.toString());
           } else {
              res.send(result.rows[0].username);
           }
       });
   } else {
       res.status(400).send('You are not logged in');
   }
});

app.post('/create-paste', function(req, res){
    
    var pasteBody = req.body.PasteBody;
    var pasteTitle = req.body.PasteTitle;
    var pasteAuthor = req.body.PasteAuthor;
    var pasteTime = req.body.PasteTime;
    var PasteAnon = req.body.AnonPaste;
    var pasteLink = crypto.randomBytes(8).toString('hex');
    var pasteUsername = null;
    if(LoggedIn && !PasteAnon) {
        pasteUsername = req.session.auth.userName;
    }
    
    pool.query('INSERT INTO "pastes" (paste_author, paste_title, paste_time, paste_link, paste_body, paste_username) VALUES ($1, $2, $3, $4, $5, $6)', 
    [pasteAuthor, pasteTitle, pasteTime, pasteLink, pasteBody, pasteUsername], function(err, result) {
        
        if(err){
            res.status(500).send(err.toString());
        } else {
            res.redirect('/');
        }
        });

});

app.post('/create_account', function(req, res){

  var username = req.body.username;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var unEncryptedPassword = req.body.password;
  
  var salt = crypto.randomBytes(128).toString('hex');
  var password = hash(unEncryptedPassword, salt);

  pool.query('INSERT INTO "ctrlvusers" (username, email, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5)', 
            [username, email, firstName, lastName, password], 
            function(err, result) {

                    if (err){
                      res.status(500).send(err.toString());
                    } else {
                      //res.send("Successfully Created User!");
                      res.redirect('/');
                    }
                  });
});

app.use(function(request, response){
    response.end(errorTemplate("Page Not Found!"));
});


function errorTemplate(errorMessage){
    
    var loginBlock = LoginBlock;
    
    if(LoggedIn){
        loginBlock = ``;
    }
    
    var errorTemplate = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=2.0">

      <link rel="stylesheet" href="/ui/style.css">
    </head>

    <body class="the_body">

    <div id="theNavigationBar">
        <ul>
          <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
          <br/>
          <li class="navBarOptions"><a href="/">Main</a></li>
          <li class="navBarOptions"><a href="/NewPaste">New Paste</a></li>
          <li class="navBarOptions"><a href="/browse">Browse</a></li>
        </ul>
      </div>

      <div class="center_wrap">

      <div class="atCenter">
      <h3>${errorMessage}</h3>
      </div>
    
    <div class="topMargin1">${loginBlock}</div>
    
    </div>
    </div>
    </div>
    
    <div class="theFooter">
    <ul>
      <li><a class="footerOptions" href="">Created with &#10084; by Arunava</a><li>
    </ul>
    </div>
  
    </body>
    </html>
`;
    
    return errorTemplate;
}

function createBrowsePage(pastesData){
    
    var eachLayout = 
    `<a class="dontDecorate" href="">
      <div class="aShortPasteLayout the_box">
        <div>
        <div>
          <h3>${title}</h3>
        </div>
        <div>
          <h4>${author}</h4>
        </div>
        </div>
        <div>
          <h5 class="goAsh">${time}</h5>
        </div>
      </div>
    </a>
    `;
    var theTotalLayout = "";
    
    var author;
    var title;
    var time;
    
    for(i=0; i<pastesData.rows.length; i++){
        author = pastesData.rows[i].paste_author;
        title  = pastesData.rows[i].paste_title;
        time   = pastesData.rows[i].paste_time;
        link   = "http://arunavadw.imad.hasura-app.io/pastes/"+pastesData.rows[i].paste_link;
        
        theTotalLayout += `
        <a class="dontDecorate" href="`+link+`">
          <div class="aShortPasteLayout the_box">
            <div>
            <div>
              <h3>`+title+`</h3>
            </div>
            </a>
            <a class="dontDecorate" href="">
            <div>
              <h4>`+author+`</h4>
            </div>
            </a>
            </div>
            <a class="dontDecorate" href="`+link+`">
            <div>
              <h5 class="goAsh">`+time+`</h5>
            </div>
          </div>
          </a>
    `;;
    }
    
    var browsePage = `
    <!DOCTYPE html>
    <html lang="en-US">
    
    <head>
      <!-- Page Colors
            #9143c8 -> Purple
            #06a209 -> Green
          -->
      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />
    
      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=2.0">
    
      <link rel="stylesheet" href="/ui/style.css">
      <link rel="stylesheet" href="/ui/pastes/bower_components/css-ripple-effect/dist/ripple.min.css">
    </head>
    
    
    <body class="the_body">
    
      <div id="theNavigationBar">
          <ul>
            <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
            <br/>
            <li class="navBarOptions"><a  class="ripple" href="/">Main</a></li>
            <li class="navBarOptions"><a class="ripple" href="/NewPaste">New Paste</a></li>
            <li class="navBarOptions"><a class="ripple" href="/browse">Browse</a></li>
          </ul>
        </div>
    
      <div class="center_wrap">
        <div class="the_box paddTop">
          <h2>Recent Pastes:</h2>
          <hr/>
          
          <div>
          ${theTotalLayout}
          </div>
          
          </div>
          </div>
          
          <div class="theFooter">
            <ul>
              <li><a class="footerOptions" href="">Created with &#10084; by Arunava</a><li>
            </ul>
          </div>
        
        </body>
        </html>
    `;
    return browsePage;
}

function createPasteTemplate(pasteData){
    var author = pasteData.paste_author;
    var time = pasteData.paste_time;
    var body = pasteData.paste_body;
    var link = pasteData.paste_link;
    var title = pasteData.paste_title;
    var completeLink = "http://arunavadw.imad.hasura-app.io/pastes/"+link;
    
    var pasteTemplate = `
    <!DOCTYPE html>
    <html lang="en-US">

    <head>

      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />

      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=2.0">

      <link rel="stylesheet" href="/ui/style.css">
      
      <script src='https://wzrd.in/standalone/copy-button@latest'></script>
      <link rel="stylesheet" href="bower_components/css-ripple-effect/dist/ripple.min.css">
    </head>

    <body class="the_body">

    <div id="theNavigationBar">
        <ul>
          <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
          <br/>
          <li class="navBarOptions"><a href="/">Main</a></li>
          <li class="navBarOptions"><a href="/NewPaste">New Paste</a></li>
          <li class="navBarOptions"><a href="/browse">Browse</a></li>
        </ul>
      </div>

      <div>

      <div class="getSomeSpace">
      <div>
      <h2>${title}</h2>
      </div>
      <div>
      <h5>${author}</h5>
      </div>
      <div>
      <h6>${time}</h6>
      </div>
      <div>
      <span class="makeItBold">Paste Live At:</span> <input id="theExtraOrdinaryText" type="text" value=${completeLink}>
      <copy-button id="addCopyImage" target-element="#theExtraOrdinaryText"><img src="/ui/Copy-50.png" title="Copy" width="40" height="40"></copy-button>
      </div>
      
      <hr/>

      </div>
      <div class="getComfortable">
      <p class="showAsFormatted">${body}</p>
      </div>
      </div>
    </body>
    </html>

    `;
    
    return pasteTemplate;
}


function createProfileTemplate(userData) {
    var firstName = userData.firstname;
    var userBio = userData.bio;
    if(userBio === null){
        userBio = "This user has no Bio";
    }
    var ctrlvHits = userData.ctrlvhits;
    if(ctrlvHits === undefined){
        ctrlvHits = 0;
    }
    
    var profileTemplate = `
        <!DOCTYPE html>
        <html lang="en-US">
        <head>
          <title>Ctrl+V</title>
          <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />
          <meta charset="utf-8">
          <meta name="description" content="A place where one could paste documents and
          access it from any where in the web">
          <meta name="keywords" content="ctrl, v, paste, clipboard, online">
          <meta name="author" content="Arunava Chakraborty">
          <meta name="viewport" content="width=device-width initial-scale=2.0">
          <link rel="stylesheet" href="/ui/style.css">
        </head>
        
        <body class="the_body">

          <div id="theNavigationBar">
            <ul>
              <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
              <br/>
              <li class="navBarOptions"><a href="/">Main</a></li>
              <li class="navBarOptions"><a href="/NewPaste">New Paste</a></li>
              <li class="navBarOptions"><a href="">Edit Profile</a></li>
              <li class="navBarOptions"><a href="/browse">Browse</a></li>
              <li class="goRight"><a href="/logout">Log Out</a></li>
            </ul>
          </div>
        
          <div class="center_wrap">
            <div id="identifier_main">
              <div class="identifier_1">
                <img id="theProfilePicture" src="/ui/blank-profile-picture.png" alt="Profile Picture"
                width="130" height="130" class="profile_picture" />
              </div>
              <div class="identifier_1">
                <div>
                  <h1 id="theFName">${firstName}</h1>
                </div>
                <div>
                  <p id="theUserBio">${userBio}</p>
                </div>
              </div>
            </div>
            <div id="identifier_next">
              <div>
                <h2 id="ctrlvHitsHeader">Ctrl+V Hits:</h2><span id="ctrlvHits">${ctrlvHits}<span>
              </div>
              <div id="identifier_show_ctrlv">
                <div>
                  <h2>Ctrl+V by you:</h2>
                </div>
                <div id="ctrlvhitsbox">
                </div>
              </div>
            </div>
          </div>
          
          <script src="/ui/main.js"></script>
        </body>
        
        </html>`;
        
        return profileTemplate;
    }

function thePastePage() {
    
    var loginBlock = LoginBlock;
    var loadMainScriptHtml = `<script src="/ui/main.js"></script>`;
    
    if(LoggedIn) {
        loginBlock = ``;
        loadMainScriptHtml = ``;
    }
    
    var pasteHtml = `
    <!DOCTYPE html>
    <html lang="en-US">
    
    <head>
      <!-- Page Colors
            #9143c8 -> Purple
            #06a209 -> Green
          -->
      <title>Ctrl+V</title>
      <link rel="shortcut icon" type="image/gif/png" href="favicon.ico" />
    
      <meta charset="utf-8">
      <meta name="description" content="A place where one could paste documents and
      access it from any where in the web">
      <meta name="keywords" content="ctrl, v, paste, clipboard, online">
      <meta name="author" content="Arunava Chakraborty">
      <meta name="viewport" content="width=device-width initial-scale=2.0">
    
      <link rel="stylesheet" href="/ui/style.css">
    </head>
    
    <body class="the_body">
    
      <div id="theNavigationBar">
        <ul>
          <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
          <br/>
          <li class="navBarOptions"><a href="/">Main</a></li>
          <li class="navBarOptions"><a href="#">New Paste</a></li>
          <li class="navBarOptions"><a href="/browse">Browse</a></li>
        </ul>
      </div>
    
      <div class="center_wrap">
        <div>
          <div>
            <textarea id="main_paste" cols="100" rows="30"></textarea>
          </div>
          <div>
            <div id="footerOptionsNewPaste">
              <div class="optionsNewPaste" id="footerOptionsNewPaste1">
                <h3>Paste As:</h3>
                <input type="text" class="newPstInputs" id="paste_as" placeholder="Anynomous" name="p_as" onblur="aRedMessageToggler()">
              </div>
              <div class="optionsNewPaste" id="footerOptionsNewPaste2">
                <h3>Title:</h3>
                <input type="text" class="newPstInputs" id="paste_title" placeholder="Untitled" name="title_of">
              </div>
              <div>
              <h5 id="aRedMessage"><span class="giveMeRed">BY DEFAULT, WHEN ANONYMOUS, YOU WILL NOT BE ABLE TO EDIT OR DELETE YOUR PASTE</span></h5>
              </div>
          </div>
        </div>
        <hr/>
        <div id="newPasteDiv">
          <button id="create_paste_submit" type="submit">Create New Paste</button>
        </div>
        </div>
        
        <div>${loginBlock}</div>
        
        </div>
        
      <div class="theFooter">
        <ul>
          <li><a class="footerOptions" href="">Created with &#10084; by Arunava</a><li>
        </ul>
      </div>
      
      <script src="/ui/pasteBrain.js"></script>
      ${loadMainScriptHtml}
    
    </body>
    
    </html>
    `;
    
    return pasteHtml;
}

function hash (input, salt) {
    
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(port, function () {
  console.log(`Listening on ${port}!\nWelcome to Ctrl+V`);
});
