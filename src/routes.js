// load up the user model
var mysql = require('mysql');
var connection = mysql.createConnection({
    host    : process.env.DB_HOST,
    user    : process.env.DB_USER,
    password : process.env.DB_PASSWORD
});

connection.query('USE ' + process.env.DB);

module.exports = function(app, express, passport) {

	/* AWS IoT Device SDK */
	var awsIot = require('aws-iot-device-sdk');
	var device = awsIot.device({
		keyPath: "certs/DogFeeder.private.key",
		certPath: "certs/DogFeeder.cert.pem",
		caPath: "certs/rootCA.pem",
		clientId: "Asiakas" + Math.floor(Math.random() * 9999),
		region: "eu-west-1"
	});

	// MOCK DATAA, haetaan kannasta kirjautuneen käyttäjän laitteiden MACit ja subscribetään kaikkien niiden DeviceToApp-topiceihin (subscribelle voi antaa arrayn topicceja)
	device.subscribe('DogFeeder/DeviceToApp/' + "123");
	device.subscribe('DogFeeder/DeviceToApp/' + "456");

	// Kuunnellaan topicin viestejä, viimeisin viesti muuttujaan
	var deviceSchedule = '';
	device
	.on('message', function(topic, payload) {
		deviceSchedule = payload.toString();
	});

	// HUOM! Älä vaihtele app.get / app.use järjestystä!

	app.get('/devices/', isLoggedIn, function (req, res){
		connection.query("SELECT name, mac FROM Device WHERE FK_user_id = ?",[req.user.id], function(err, rows){
            if(err)
            {
                console.log("Virhe SQL-kyselyssä.");
                res.send(err);
            }
            console.log("Palautetaan devicet");
            res.send(rows);
        });
	})

	app.get('/logout', logout);

	app.get('/', isLoggedIn, function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	
	app.get('/aikataulu', isLoggedIn, function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});

	app.use(express.static(__dirname + '/static'));

	app.get('*', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});


	/* API endpointit */
	/* Insta feed: lähetetään laitteelle viesti ruokinnasta heti */
	app.post('/feed/', function(req, res){
		var macParsed = String(req.body.mac).replace(/%3A/g, ":");
		device.publish('DogFeeder/AppToDevice/' + macParsed, JSON.stringify({ foodfeed: 'instant' }));

		/* postin debuggausta varten */
		/*
		res.setHeader('Content-Type', 'text/plain')
		res.write('you posted:\n')
		res.end(JSON.stringify(req.body, null, 2))
		*/
	});

	/* Schedule feed: Lähetetään laitteelle ruokinta aikataulu */
	app.post('/schedule/', function(req, res){
		var macParsed = String(req.body.mac).replace(/%3A/g, ":");
		var schedule = req.body.schedule;
		device.publish('DogFeeder/AppToDevice/' + macParsed, JSON.stringify({ schedule }));
	});

	/* Pyydetään laitteelta aikataulu -> raspi lähettää DeviceToApp topicciin aikataulun -> se lähetetään responsessa frontille */
	app.post('/device/', function(req, res){
		deviceSchedule = ''; // tyhjätään muuttujasta entinen aikataulu
		var macParsed = String(req.body.mac).replace(/%3A/g, ":");
		device.publish('DogFeeder/AppToDevice/' + macParsed, JSON.stringify({ get: 'schedule' })); // lähetetään raspille pyyntö aikataulusta
		sendScheduleToApp(res); // odotellaan että raspi lähettää aikataulun
	})

	function sendScheduleToApp(res) {
		if (deviceSchedule) {
			res.json(deviceSchedule); // palautetaan aikataulu frontille responsessa
		}
		else {
			setTimeout(sendScheduleToApp, 500, res) // odotellaan raspia...
		}
	}

	/* Login */
	app.post('/login',
	  	passport.authenticate('local-login', { 
	  		successRedirect: '/',
		  	failureRedirect: '/login',
		    failureFlash: true 
		})
	);

	/* Signup */
	app.post('/signup',
	    passport.authenticate('local-signup', { 
		  	successRedirect: '/',
	 		failureRedirect: '/login',
		    failureFlash: true 
		})
	);	
};

function logout(req,res)
{
	if (req.isAuthenticated())
	{
		console.log("Logging out user: " + req.user.email);
		req.logout();
	}
	else
	{
		console.log("Already logged out.");
	}
	res.redirect('/login');
}

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
	{
		console.log("User ok.");
		return next();
	}

	// if they aren't redirect them
	console.log("User has no privileges, redirecting to login.");
	res.redirect('/login');
}