/* ExpressJS alkaa */
/* luodaan serveri ja laitetaan se kuuntelemaan porttia 2000 */
/* kun porttiin 2000 tulee pyyntö, serverille kerrotaan siitä ja riippuen pyynnöstä tehdään jokin toiminto */
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config');
var app = express();
var serv = require('http').Server(app);


var compiler = webpack(config);
 
app.use(compiler, {
  noInfo: true,
  publicPath: config.output.publicPath
});

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html'); //tyhjä pyyntö -> lähetetään /client/index.html
});
app.use(Express.static(__dirname + 'static')); //pyyntö alkaa /src -> lähetetään pyydetty tiedosto /src kansiosta

/* client voi pyytää tiedostoja vain kahdesta yllä olevasta paikasta */
/* eli jos pyydetään esim. /server/secureFile.js -> ei tee yhtikäs mitään */

serv.listen(9000, err => {
	if (err) {
		return console.error(err);
	}
	console.log("Serveri startattu: kuuntelee porttia 9000.");
});
/* ExpressJS loppuu */