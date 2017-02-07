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

	// HUOM! Älä vaihtele app.get / app.use järjestystä!
	
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
		device.publish('DogFeeder/' + macParsed, JSON.stringify({ foodfeed: 'instant' }));

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
		device.publish('DogFeeder/' + macParsed, JSON.stringify({ schedule }));

		res.setHeader('Content-Type', 'text/plain')
		res.write('you posted:\n')
		res.end(JSON.stringify(req.body, null, 2))
	});

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