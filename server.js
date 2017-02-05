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

app.use(jsonParser);
var multer  = require('multer');
var upload = multer();
var flash = require('connect-flash');
app.use(flash());

app.use(session({ cookie: { secure : false, maxAge : 60000 }, 
                  secret: 'woot',
                  resave: true, 
                  saveUninitialized: true}));

/*Passport*/
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./src/passport.js')(passport);
app.use(passport.initialize());
app.use(passport.session());



require('./src/routes.js')(app, express, upload, passport); 

// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
  if (err) {
    return console.error(err);
  }
  console.log("Serveri startattu: kuuntelee porttia 9000.");
});