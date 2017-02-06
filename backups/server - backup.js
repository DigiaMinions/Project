// EI server side renderöintiä käyttöön, koska
// http://stackoverflow.com/questions/27290354/reactjs-server-side-rendering-vs-client-side-rendering

// For multi-page apps you can add multiple entry points (one per page) to your webpack config:
// https://webpack.github.io/docs/multiple-entry-points.html


/* AWS IoT Device SDK */
var awsIot = require('aws-iot-device-sdk');
var device = awsIot.device({
	keyPath: "certs/DogFeeder.private.key",
	certPath: "certs/DogFeeder.cert.pem",
	caPath: "certs/rootCA.pem",
	clientId: "Asiakas" + Math.floor(Math.random() * 9999),
	region: "eu-west-1"
});

/* ExpressJS */
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var session = require('express-session');
var bodyParser = require('body-parser');
var rawParser = bodyParser.raw();
var textParser = bodyParser.text();
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json(); // JSON body

var multer  = require('multer');
var upload = multer();
var flash = require('connect-flash');
app.use(flash());

app.use(session({ cookie: { secure : false, maxAge : 60000 }, 
                  secret: 'woot',
                  resave: true, 
                  saveUninitialized: true}));

/*MySQL*/
// https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84
// https://github.com/manjeshpv/node-express-passport-mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
          host     : 'feederinstance.ckpt8o3e701r.eu-west-1.rds.amazonaws.com',
          user     : 'masterminion',
          password : 'masterpassword!'
        });
connection.query('USE feeder;');

/*Passport*/
var passport = require('passport');
app.use(passport.initialize());
app.use(passport.session());
var LocalStrategy = require('passport-local').Strategy;

// sessionin ymmärtämiseen
// http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize

app.use(function(err, req, res, next) {
    console.log(err);
});

passport.serializeUser(function(user, done) {
  console.log("Serialisoidaan käyttäjä.")
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("Deserialisoidaan käyttäjä.")
  connection.query("select * from User where id = "+id,function(err,rows){ 
      done(err, rows[0]);
    });
});


passport.use('local-signup', new LocalStrategy(
{
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) 
{
  console.log("Käsitellään signuppia...");
  // find a user whose email is the same as the forms email
  // we are checking to see if the user trying to login already exists
  connection.query("select * from User where email = '"+email+"'",function(err,rows)
  {
    console.log(rows);
    console.log("above row object");
    if (err)
    {
      return done(err);
    }              
    if (rows.length) 
    {
      return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
    } 
    else 
    {
      // if there is no user with that email
      // create the user
      var newUserMysql = new Object();      
      var salt = "suola";
      var firstname = req.body.firstname;
      var lastname = req.body.lastname;
      newUserMysql.firstname = firstname;
      newUserMysql.lastname = lastname;
      newUserMysql.email    = email;
      newUserMysql.password = password; // use the generateHash function in our user model    
      newUserMysql.salt     = salt;
      var insertQuery = "INSERT INTO User ( firstname, lastname, email, password, salt ) values ('" + firstname + "','" + lastname + "','" + email +"','"+ password +"','"+ salt +"')";
      console.log(insertQuery);
      
      connection.query(insertQuery,function(err,rows)
      {
        console.log("insertquery rows data:");
        console.log(rows);
        newUserMysql.id = rows.insertId;        
        return done(null, newUserMysql);
      }); 
    }  
  });
}));

passport.use('local-login', new LocalStrategy(
{
    // by default, local strategy uses username and password, we will override with email
    usernameField : 'email',
    passwordField : 'password',
    passReqToCallback : true // allows us to pass back the entire request to the callback
},
function(req, email, password, done) 
{ 
  console.log("Käsitellään loginia...");
  // callback with email and password from our form
  connection.query("SELECT id, email, password FROM User WHERE email = '" + email + "'",function(err,rows)
  {
    if (err)
    {
      console.log("Virhe MySQL kyselyssä.");
      return done(err);
    }              
    if (!rows.length) 
    {
      console.log("Käyttäjää ei löytynyt.");
      return done(null, false, req.flash('loginMessage', 'No user found.')); // req.flash is the way to set flashdata using connect-flash
    }   
    // if the user is found but the password is wrong
    if (!( rows[0].password == password))
    {
      console.log(rows[0]);
      console.log("Väärä salasana.");
      return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.')); // create the loginMessage and save it to session as flashdata
    }
      console.log("Käyttäjä löytyi, kirjataan sisään...")
      // all is well, return successful user
      return done(null, rows[0]);   
  });
}));



function loggedIn(req, res, next) {
 
  console.log("req.user " + req.user);
  if(!req.user)
  {
    console.log("Käyttäjällä ei oikeuksia, uudelleenohjataan loginiin.");
    res.redirect('/login');
  }
  else
  {
    console.log("Käyttäjällä oikeudet kunnossa, annetaan jatkaa.");
    next();   
  }

  /*
    if(!req.session)
    {
      console.log("req.session " + req.session);
      console.log("Käyttäjällä ei oikeuksia, uudelleenohjataan loginiin.");
      res.redirect('/login');
    }
    else
    {
      if(!req.session.passport)
      {
        console.log("req.session.passport " + req.session.passport);
        console.log("Käyttäjällä ei oikeuksia, uudelleenohjataan loginiin.");
         res.redirect('/login');
      }
      else
      {
        if(!req.session.passport.user) 
        {
          console.log("req.session.passport.user " + req.session.passport.user);
          console.log("Käyttäjällä ei oikeuksia, uudelleenohjataan loginiin.");
          res.redirect('/login');      
        }
        else
        {
          console.log("Käyttäjällä oikeudet kunnossa, annetaan jatkaa.");
          next();   
        }
      }      
    }*/ 
};

// HUOM! Älä vaihtele app.get / app.use järjestystä!

app.get('/', function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});
/*
app.get('/aikataulu', loggedIn, function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});
*/
app.use(express.static(__dirname + '/src/static'));

app.get('/login', function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});
/*
app.get('*', function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});
*/


/* API endpointit */
/* Insta feed */
app.post('/feed/', jsonParser, function(req, res){
	var macParsed = String(req.body.mac).replace(/%3A/g, ":");
	device.publish('DogFeeder/' + macParsed, JSON.stringify({ foodfeed: 'instant' }));

	res.setHeader('Content-Type', 'text/plain')
	res.write('you posted:\n')
	res.end(JSON.stringify(req.body, null, 2))
});

/* TODO: Schedule feed */
app.post('/schedule/', jsonParser, function(req, res){
	var macParsed = String(req.body.mac).replace(/%3A/g, ":");
	var schedule = req.body.schedule;
	device.publish('DogFeeder/' + macParsed, JSON.stringify({ schedule }));

	res.setHeader('Content-Type', 'text/plain')
	res.write('you posted:\n')
	res.end(JSON.stringify(req.body, null, 2))
});

app.post('/login', upload.array(), 
  passport.authenticate('local-login', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);

app.post('/signup', upload.array(), 
  passport.authenticate('local-signup', { successRedirect: '/',
                                   failureRedirect: '/login',
                                   failureFlash: true })
);




// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
  if (err) {
    return console.error(err);
  }
  console.log("Serveri startattu: kuuntelee porttia 9000.");
});