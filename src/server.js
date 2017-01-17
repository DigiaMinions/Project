/* ExpressJS alkaa */
/* luodaan serveri ja laitetaan se kuuntelemaan porttia 9000 */
/* kun porttiin 9000 tulee pyyntö, serverille kerrotaan siitä ja riippuen pyynnöstä tehdään jokin toiminto */
var express = require('express');
var app = express();
var serv = require('http').Server(app);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html'); //tyhjä pyyntö -> lähetetään /static/index.html
});
app.use(express.static(__dirname + '/static')); //pyyntö alkaa /static -> lähetetään pyydetty tiedosto /static kansiosta

/* client voi pyytää tiedostoja vain kahdesta yllä olevasta paikasta */
/* eli jos pyydetään esim. /server/secureFile.js -> ei tee yhtikäs mitään */

serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});
/* ExpressJS loppuu */