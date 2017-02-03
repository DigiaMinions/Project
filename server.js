/* AWS IoT Device SDK */
const validator = require('validator');
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
var session = require('express-session')
var bodyParser = require('body-parser')
app.use(bodyParser.json()); // JSON body

var flash = require('connect-flash');
app.use(flash());

/* Router */
// tarpeellinen?
var router = express.Router();

/*Passport*/
var passport = require('passport');
passport.initialize();
var LocalStrategy = require('passport-local').Strategy;


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

var users = [];

passport.use(new LocalStrategy(
  function(username, password, done) {
    users.push(username);
    return done(null, user);
  }
));



// HUOM! Älä vaihtele app.get / app.use järjestystä!

app.get('/', loggedIn, function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});

app.get('/aikataulu', loggedIn, function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});

app.use(express.static(__dirname + '/src/static'));

app.get('/login', function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});

app.get('*', function (req,res){
  res.sendFile(__dirname + '/src/static/index.html');
});

// EI server side renderöintiä käyttöön, koska
// http://stackoverflow.com/questions/27290354/reactjs-server-side-rendering-vs-client-side-rendering

// For multi-page apps you can add multiple entry points (one per page) to your webpack config:
// https://webpack.github.io/docs/multiple-entry-points.html


function loggedIn(req, res, next) {
    //if (req.user) {
    if(true) {
    	console.log("User ok.");
        next();
    } else {
    	console.log("User ei ok, uudelleenohjataan.");
        res.redirect('/login');
    }
};


function validateSignupForm(payload) {
  const errors = {};
  var isFormValid = true;
  var message = '';

  if (!payload || typeof payload.email !== 'string' || !validator.isEmail(payload.email)) {
    isFormValid = false;
    errors.email = 'Please provide a correct email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length < 8) {
    isFormValid = false;
    errors.password = 'Password must have at least 8 characters.';
  }

  if (!payload || typeof payload.name !== 'string' || payload.name.trim().length === 0) {
    isFormValid = false;
    errors.name = 'Please provide your name.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

/**
 * Validate the login form
 *
 * @param {object} payload - the HTTP body message
 * @returns {object} The result of validation. Object contains a boolean validation result,
 *                   errors tips, and a global message for the whole form.
 */
function validateLoginForm(payload) {
  const errors = {};
  var isFormValid = true;
  var message = '';

  if (!payload || typeof payload.email !== 'string' || payload.email.trim().length === 0) {
    isFormValid = false;
    errors.email = 'Please provide your email address.';
  }

  if (!payload || typeof payload.password !== 'string' || payload.password.trim().length === 0) {
    isFormValid = false;
    errors.password = 'Please provide your password.';
  }

  if (!isFormValid) {
    message = 'Check the form for errors.';
  }

  return {
    success: isFormValid,
    message,
    errors
  };
}

/* API endpointit */
/* Insta feed */
app.post('/feed/', function(req, res){
	var macParsed = String(req.body.mac).replace(/%3A/g, ":");
	device.publish('DogFeeder/' + macParsed, JSON.stringify({ foodfeed: 'instant' }));

	res.setHeader('Content-Type', 'text/plain')
	res.write('you posted:\n')
	res.end(JSON.stringify(req.body, null, 2))
});

/* TODO: Schedule feed */
app.post('/schedule/', function(req, res){
	var macParsed = String(req.body.mac).replace(/%3A/g, ":");
	var schedule = req.body.schedule;
	device.publish('DogFeeder/' + macParsed, JSON.stringify({ schedule }));

	res.setHeader('Content-Type', 'text/plain')
	res.write('you posted:\n')
	res.end(JSON.stringify(req.body, null, 2))
});

app.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/login' })
);

// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});