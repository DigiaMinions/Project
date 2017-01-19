/* ExpressJS alkaa */
/* luodaan serveri ja laitetaan se kuuntelemaan porttia 9000 */
/* kun porttiin 9000 tulee pyyntö, serverille kerrotaan siitä ja riippuen pyynnöstä tehdään jokin toiminto */
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/src/static/index.html'); //tyhjä pyyntö -> lähetetään /static/index.html
});

app.use(express.static(__dirname + '/src/static')); //pyyntö static-kansioon -> lähetetään pyydetty tiedosto kansiosta

/* client voi pyytää tiedostoja vain kahdesta yllä olevasta paikasta */
/* eli jos pyydetään esim. /server/secureFile.js -> ei tee yhtikäs mitään */

/* Kannasta käyttäjän laitteiden haku */
app.get('/devices/:user', function(req, res){
	var user = req.params.user;
	res.json({"Käyttäjä: " : user, "Laite" : "xxx"});
});

serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});
/* ExpressJS loppuu */