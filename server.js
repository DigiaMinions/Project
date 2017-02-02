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
var bodyParser = require('body-parser')
app.use(bodyParser.json()); // JSON body

/* Router */
// tarpeellinen?
var router = express.Router();

/*Passport*/
var passport = require('passport');
passport.initialize();
var LocalStrategy = require('passport-local').Strategy;


app.get('/', loggedIn, function (req, res){	
  res.sendFile(__dirname + '/src/static/index.html'); // tyhjä pyyntö -> lähetetään /static/index.html
});

app.get('/aikataulu', loggedIn, function (req, res){	
  res.sendFile(__dirname + '/src/static/index.html'); // lähetetään /static/index.html
});

app.get('/login', function (req, res){
	res.sendFile(__dirname + '/src/static/login.html');
});

app.get('/js/login.js', function (req, res) {
  res.sendFile(__dirname + '/src/static/js/login.js');
});

app.get('/css/login.css', function (req, res) {
  res.sendFile(__dirname + '/src/static/css/login.css');
});

app.get('/css/style.css', function (req, res) {
  res.sendFile(__dirname + '/src/static/css/style.css');
});

app.get('/js/bundle.js', function (req, res) {
  res.sendFile(__dirname + '/src/static/js/bundle.js');
});

app.get('*', function (req,res){
	res.sendFile(__dirname + '/src/static/index.html');
});

// HUOM! julkisten filujen antaminen tultava api.gettien jälkeen, jotta ohjaus toimii oikein.
//app.use(express.static(__dirname + '/src/static')); // pyyntö julkiseen static-kansioon -> lähetetään pyydetty tiedosto kansiosta

var users = [ 'test' ];

// EI server side renderöintiä käyttöön, koska
// http://stackoverflow.com/questions/27290354/reactjs-server-side-rendering-vs-client-side-rendering

// For multi-page apps you can add multiple entry points (one per page) to your webpack config:
// https://webpack.github.io/docs/multiple-entry-points.html


function loggedIn(req, res, next) {
    //if (req.user) {
    if(users.length == 2) {
    	console.log("User ok.");
        next();
    } else {
    	console.log("User ei ok, uudelleenohjataan.");
        res.redirect('/login');
    }
};

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

// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});