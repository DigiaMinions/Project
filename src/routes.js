

module.exports = function(app, express, upload, passport) {

	// HUOM! Älä vaihtele app.get / app.use järjestystä!

	app.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/login');
	});

	app.get('/', isLoggedIn, function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	
	app.get('/aikataulu', isLoggedIn, function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	
	app.use(express.static(__dirname + '/static'));

	app.get('/login', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	app.get('/signup', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	
	app.get('*', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});
	


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

	app.post('/login', upload.array(),
	  	passport.authenticate('local-login', { 
		  	successRedirect: '/',
		  	failureRedirect: '/login',
		    failureFlash: true 
		})	    
	);

	app.post('/signup', upload.array(),
	    passport.authenticate('local-signup', { 
		  	successRedirect: '/',
	 		failureRedirect: '/login',
		    failureFlash: true 
		})
	);
};

// route middleware to make sure
function isLoggedIn(req, res, next) {

	// if user is authenticated in the session, carry on
	if (req.isAuthenticated())
	{
		console.log("Käytäjä ok.");
		return next();
	}

	// if they aren't redirect them
	console.log("Käyttäjällä ei oikeuksia, uudelleenohjataan loginiin.");
	res.redirect('/login');
}