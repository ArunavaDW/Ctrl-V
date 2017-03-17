var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var crypto = require('crypto');
var bodyParser = require('body-parser');
var session = require('express-session');

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

function errorTemplate(errorMessage){
    
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
    
      <link rel="stylesheet" href="style.css">
    </head>
    
    <body class="the_body">
    
    <div id="theNavigationBar">
        <ul>
          <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
          <br/>
          <li class="navBarOptions"><a href="">Main</a></li>
          <li class="navBarOptions"><a href="">New Paste</a></li>
          <li class="navBarOptions"><a href="">Edit Profile</a></li>
          <li class="navBarOptions"><a href="">Browse</a></li>
        </ul>
      </div>
      
      <div class="atCenter">
      <h3>${errorMessage}</h3>
      </div>
    
    </body>
    </html>
    
    `;
}



function createProfileTemplate(username) {
    
    pool.query('SELECT * FROM "ctrlvusers" WHERE username = $1', [username], function (err, result) {
        
        if(err){
            res.status(500).send(err.toString());
        } else {
            
            if(result.rows.length === 0){
                
                res.send(errorTemplate("Invalid Username/Password!"));
            } else {
            
            queryResult = result.rows[0];
            firstName = queryResult.firstname;
            userBio = queryResult.bio;
            if(userBio === null){
                userBio = "This user likes to keep an Air of Mystery around him";
            }
            ctrlvHits = queryResult.ctrlvhits;
            
            
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
                
                  <link rel="stylesheet" href="style.css">
                </head>
                
                <body class="the_body">
                
                  <div id="theNavigationBar">
                    <ul>
                      <li><a class="navBarOption_site_name" href=''>Ctrl+V</a></li>
                      <br/>
                      <li class="navBarOptions"><a href="">Main</a></li>
                      <li class="navBarOptions"><a href="">New Paste</a></li>
                      <li class="navBarOptions"><a href="">Edit Profile</a></li>
                      <li class="navBarOptions"><a href="">Browse</a></li>
                    </ul>
                  </div>
                
                  <div class="center_wrap">
                    <div id="identifier_main">
                      <div class="identifier_1">
                        <img id="theProfilePicture" src="blank-profile-picture.png" alt="Profile Picture"
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
                </body>
                
                </html>`;
            }
        }
    });
    }
}


app.get('/ctrlVUsers-db', function (req, res) {
  
  pool.query('SELECT * FROM ctrlvusers', function(err, result){
      if (err) {res.status(500).send(err.toString());}
      else {res.send(result);}
  });
  
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', 'index.html'));
});

app.get('/ui/:fileName', function (req, res) {
  res.sendFile(path.join(__dirname, 'ui', req.params.fileName));
});

var pool = new Pool(config);


/*app.get('/theProfile.html', function (req, res) {
  res.sendFile(path.join(__dirname, 'theProfile.html'));
});*/

app.post('/login', function(req, res){
    
    var userName = req.body.username;
    var passWord = req.body.password;
    
    pool.query('SELECT * FROM ctrlvusers WHERE username = $1', [userName], function(err, res) {
        
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
                    req.session.auth = {userId: result.rows[0].id};
                    // set cookie with a session id
                    // internally, on the server side, it maps the session id to an object
                    // { auth: {userId }}
                    
                    res.send('credentials correct!');
                    
                  } else {
                    res.status(403).send('username/password is invalid');
        }
              }
        }
});
});

function hash (input, salt) {
    
    var hashed = crypto.pbkdf2Sync(input, salt, 10000, 512, 'sha512');
    return ["pbkdf2", "10000", salt, hashed.toString('hex')].join('$');
}

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
                      res.send("Successfully Created User!");
                      res.send(createProfileTemplate(username));
                    }
                  });
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(port, function () {
  console.log(`Listening on ${port}!\nWelcome to Ctrl+V`);
});
