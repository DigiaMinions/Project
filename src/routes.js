

module.exports = function(app, express, passport) {

	// HUOM! Älä vaihtele app.get / app.use järjestystä!
	
	app.get('/logout', function(req, res) {
		console.log("Logging out.");
		req.logout();
		res.redirect('/auth');
	});

	app.get('/login', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});

	app.get('/signup', function (req,res){
	  res.sendFile(__dirname + '/static/index.html');
	});

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
	  	passport.authenticate('local-login', { 
	  		successRedirect: '/',
		  	failureRedirect: '/login',
		    failureFlash: true 
		})
	);

	app.post('/signup',
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

/* passport.authenticate('local-login', function(err, user, info) 
	  {
	    if (err) 
    	{ 
    		console.log('Virhe.')
    		return next(err);
    	}
	    // Redirect if it fails
	    if (!user) 
    	{ 
    		res.send({redirect: '/login'});
    	}
	    req.logIn(user, function(err) 
	    {
	    	if (err) 
    		{ 
    			return next(err); 
    		}
	        // Redirect if it succeeds
	    	res.send({redirect: '/'});
	    });
	  })(req, res, next);*/