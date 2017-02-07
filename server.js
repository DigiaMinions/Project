// EI server side renderöintiä käyttöön, koska
// http://stackoverflow.com/questions/27290354/reactjs-server-side-rendering-vs-client-side-rendering

// For multi-page apps you can add multiple entry points (one per page) to your webpack config:
// https://webpack.github.io/docs/multiple-entry-points.html

/*MySQL*/
// https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84
// https://github.com/manjeshpv/node-express-passport-mysql

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
app.use(urlencodedParser);
var flash = require('connect-flash');
app.use(flash());

// sessionin ymmärtämiseen
// http://stackoverflow.com/questions/27637609/understanding-passport-serialize-deserialize
app.use(session({ //cookie: { secure : false, maxAge : 60000 }, 
	secret: 'woot',
	resave: true, 
	saveUninitialized: true
}));

/* Passport */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
require('./src/passport.js')(passport);
app.use(passport.initialize());
app.use(passport.session());

require('./src/routes.js')(app, express, passport); 

// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});