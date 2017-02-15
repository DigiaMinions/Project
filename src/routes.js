

module.exports = function(app, express, passport, upload, connection, session, sessionStore) {
	var AWS = require('aws-sdk');

	var iot = new AWS.Iot({ accessKeyId: process.env.ACCESSKEYID, region:'eu-west-1', secretAccessKey: process.env.SECRETACCESSKEY});

	AWS.config.update({});
	// HUOM! järjestys oleellinen!

	app.get('/css/style.css', function (req,res){	
	console.log('sending css');	
		res.sendFile(__dirname + '/static/css/style.css');
	});

	app.get('/js/bundle.js', function (req,res){		
		console.log('sending bundle');	
		res.sendFile(__dirname + '/static/js/bundle.js');
	});

	app.get('/js/bundle.js.map', function (req,res){		
		console.log('sending map');	
		res.sendFile(__dirname + '/static/js/bundle.js.map');
	});

	app.use(passport.initialize());
	app.use(passport.session());

	app.get('/logout', logout);

	app.get('/', isLoggedIn, function (req,res){		
		res.sendFile(__dirname + '/static/index.html');
	});
	
	app.get('/aikataulu', isLoggedIn, function (req,res){
		res.sendFile(__dirname + '/static/index.html');
	});

	app.get('/tilaus', isLoggedIn, function (req,res){
	  	res.sendFile(__dirname + '/static/index.html');
	});

	/* AWS IoT Device SDK */
	var awsIot = require('aws-iot-device-sdk');
	var device = awsIot.device({
		keyPath: "certs/DogFeeder.private.key",
		certPath: "certs/DogFeeder.cert.pem",
		caPath: "certs/rootCA.pem",
		clientId: "Asiakas" + Math.floor(Math.random() * 9999),
		region: "eu-west-1"
	});

	// Kuunnellaan topicin viestejä, viimeisin viesti muuttujaan
	var deviceSchedule = '';
	device
	.on('message', function(topic, payload) {
		deviceSchedule = payload.toString();
		console.log(payload.toString());
	});

	app.get('/devices/', isLoggedIn, function (req, res){
		getDevices(req, function(rows){
			//console.log('Users devices.');
			//console.log(rows);
			res.send(rows);
		});
	});

	app.get('*', function (req,res){
	  	res.sendFile(__dirname + '/static/index.html');
	});

	/* API endpointit */
	/* Insta feed: lähetetään laitteelle viesti ruokinnasta heti */
	app.post('/feed/', function(req, res){
		var macParsed = String(req.body.mac).replace(/%3A/g, ":");
		device.publish('DogFeeder/AppToDevice/' + macParsed, JSON.stringify({ feed: 'JUST_DO_IT' }));

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

	/* Anturin kalibrointi */
	app.post('/calibrate/', function(req, res){
		var macParsed = String(req.body.mac).replace(/%3A/g, ":");
		device.publish('DogFeeder/AppToDevice/' + macParsed, JSON.stringify({ tare: 'JUST_DO_IT' }));
	});

	// bodyparser EI tue multipart dataa
	// apuja formeihin ja multipart dataan
	// https://philna.sh/blog/2016/06/13/the-surprise-multipart-form-data/

	/* Login */
	app.post('/login', upload.array(),
	    passport.authenticate('local-login', { failureRedirect: '/login' }),
	    function (req,res){
	    	// jostain syystä redirect ei toimi tätä kautta, vaan täytyy uudelleenohjata clientin päässä successin jälkeen
	    	subscribeDevices(req);
	    	return res.redirect('/');
	    }
	);	

	/* Signup */
	app.post('/signup', upload.array(),
	    passport.authenticate('local-signup', { failureRedirect: '/signup' }),
		function (req,res){
			// jostain syystä redirect ei toimi tätä kautta, vaan täytyy uudelleenohjata clientin päässä successin jälkeen
			return res.redirect('/');
		}
	);	

	app.post('/tilaus', upload.array(), function(req, res, next) {
		isLoggedIn(req, res, next);
	},function(req,res, next){
		console.log('Nimi: ' + req.body.name);
		if(req.body)
		{

			addDevice(req, function(message){				
				res.sendStatus(message);
			});
		}
		else
		{
			console.log('Empty post request.')
			res.send(400);
		}
	});	

	function addDevice(req, cb)
	{
		var name = req.body.name;
		var mac = req.body.mac;
		var userId = req.user.id;

		connection.query("INSERT INTO Device (name, mac, FK_user_id, FK_devtype_id) VALUES (?, ?, ?, 1)",[name, mac, userId], function(err, rows){
			if(err)
			{
				console.log(err);
				cb(500,err);
			}
			else
			{
				CreateNewDocVersion(mac, iot);
				cb(200);
			}
		});
	}

	function sendScheduleToApp(res) 
	{
		if (deviceSchedule) {
			res.json(deviceSchedule); // palautetaan aikataulu frontille responsessa
		}
		else {
			setTimeout(sendScheduleToApp, 500, res) // odotellaan raspia kunnes se lähettää aikataulunsa
		}
	}

	function subscribeDevices(req)
	{
		getDevices(req, function(rows){
			for(var i = 0; i<rows.length;i++)
			{			
				console.log("Subscribing " + rows[i].mac);
				device.subscribe('DogFeeder/DeviceToApp/' + rows[i].mac);			
			}
		});
	}

	function unsubscribeDevices(req)
	{
		getDevices(req, function(rows){
			for(var i = 0; i<rows.length;i++)
			{			
				console.log("Unsubscribing " + rows[i].mac);
				device.unsubscribe('DogFeeder/DeviceToApp/' + rows[i].mac);			
			}
		});
	}

	function logout(req,res)
	{
		if (req.isAuthenticated())
		{
			unsubscribeDevices(req);
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

	function getDevices(req, cb){
		connection.query("SELECT name, mac FROM Device WHERE FK_user_id = ?",[req.user.id], function(err, rows){
	        if(err)
	        {
	            console.log("Virhe SQL-kyselyssä.");
	            res.send(err);
	        }
	        cb(rows);
	    });
	}

	function DeleteOldDocVersion(iot){

		var policyv = {
			policyName: 'Generic' /* required */

		};
		iot.listPolicyVersions(policyv, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else     console.log('listPolicyVersions success');         // successful response

			var oldVersion = data.policyVersions[1].versionId;

			var params = {
				  policyName: 'Generic', 
				  policyVersionId: oldVersion
				};
			iot.deletePolicyVersion(params, function(err, newdata) {
			  if (err) console.log(err, err.stack); // an error occurred
			  else     console.log('deletePolicyVersion success');           // successful response
			});
		});
		
	}

	function CreateNewDocVersion(mac, iot)
	{
		var doc = {
			policyName: 'Generic' /* required */
		};
		iot.getPolicy(doc, function(err, data) {
			if (err) console.log(err, err.stack); // an error occurred
			else     console.log('getPolicy success');           // successful response
			var policyDoc = JSON.parse(data.policyDocument);

			policyDoc.Statement[0].Resource.push("arn:aws:iot:eu-west-1:774482297846:client/" + mac);
			var policyData = JSON.stringify(policyDoc);

			var params = {
				policyDocument: policyData,
				policyName: 'Generic', 
				setAsDefault: true
			};

			iot.createPolicyVersion(params, function(err, newdata) {
				if (err) console.log(err, err.stack); // an error occurred
				else     console.log('createPolicyVersion success');           // successful response

				DeleteOldDocVersion(iot);
			});

			
		});

	}

};