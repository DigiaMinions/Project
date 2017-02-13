// EI server side renderöintiä käyttöön, koska
// http://stackoverflow.com/questions/27290354/reactjs-server-side-rendering-vs-client-side-rendering

// For multi-page apps you can add multiple entry points (one per page) to your webpack config:
// https://webpack.github.io/docs/multiple-entry-points.html

require('dotenv').config();
/* ExpressJS */
var express = require('express');
var app = express();
var serv = require('http').Server(app);
var session = require('express-session');
var MySQLStore = require('express-mysql-session')(session);
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var urlencodedParser = bodyParser.urlencoded({ extended: true });
var jsonParser = bodyParser.json(); // JSON body
app.use(jsonParser);
app.use(urlencodedParser);

var flash = require('connect-flash');
app.use(flash());

/*MySQL*/
// https://gist.github.com/manjeshpv/84446e6aa5b3689e8b84
// https://github.com/manjeshpv/node-express-passport-mysql
var mysql = require('mysql');
var connection = mysql.createConnection({
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password : process.env.DB_PASSWORD
});

var sessionStore = new MySQLStore({
  	host: process.env.DB_HOST,// Host name for database connection. 
    port: 3306,// Port number for database connection. 
    user: process.env.DB_USER,// Database user. 
    password: process.env.DB_PASSWORD,// Password for the above database user. 
    database: process.env.DB,// Database name. 
    checkExpirationInterval: 900000,// How frequently expired sessions will be cleared; milliseconds. 
    expiration: 86400000,// The maximum age of a valid session; milliseconds.    
	createDatabaseTable: true,// Whether or not to create the sessions database table, if one does not already exist. 
    connectionLimit: 1,// Number of connections when creating a connection pool 
    schema: {
        tableName: 'sessions',
        columnNames: {
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }
}, connection);

connection.query('USE ' + process.env.DB);

// sessionin ymmärtämiseen
// https://github.com/expressjs/session
app.use(session({ cookie: { path: '/', secure : false, maxAge : 360000 }, 
	secret: process.env.COOKIE_SECRET,
	store: sessionStore,
	resave: false, 
	saveUninitialized: true
}));

/* Passport */
var passport = require('passport');
require('./src/passport.js')(passport, connection);
require('./src/routes.js')(app, express, passport, upload, connection, session, sessionStore); 

// Serveri kuuntelee porttia 9000
serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});