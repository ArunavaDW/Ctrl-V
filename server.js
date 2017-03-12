var express = require('express');
var morgan = require('morgan');
var path = require('path');
var Pool = require('pg').Pool;
var bodyParser = require('body-parser');

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


/*app.get('/ctrlVUsers-db', function (req, res) {
  
  pool.query('SELECT * FROM ctrlvusers', function(err, result){
      if (err) {res.status(500).send(err.toString());}
      else {res.send(result);}
  });
  
});*/

app.use(favicon(path.join(__dirname, 'favicon.ico')));

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/ui/style.css', function (req, res) {
  res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/ui/main.js', function (req, res) {
  res.sendFile(path.join(__dirname, 'main.js'));
});

var pool = new Pool(config);


app.get('/theProfile.html', function (req, res) {
  res.sendFile(path.join(__dirname, 'theProfile.html'));
});

app.get('/ctrlVIcon.png', function(req, res){
    res.sendFile(path.join(__dirname, 'ctrlVIcon.png'));
});

app.post('/create_account', function(req, res){

  var username = req.body.username;
  var firstName = req.body.firstname;
  var lastName = req.body.lastname;
  var email = req.body.email;
  var password = req.body.password;

  pool.query("INSERT INTO 'ctrlvusers' (username, email, firstname, lastname, password) VALUES ($1, $2, $3, $4, $5)", 
            [username, email, firstName, lastName, password], 
            function(err, result) {

                    if (err){
                      res.status(500).send(err.toString());
                    } else {
                      res.send("Successfully Created User!");
                    }
                  });
});

var port = 8080; // Use 8080 for local development because you might already have apache running on 80
app.listen(port, function () {
  console.log(`Listening on ${port}!\nWelcome to Ctrl+V`);
});
