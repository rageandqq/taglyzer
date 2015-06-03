var express = require('express'),
    http = require('http'),
    config = require('./config'),
    socketIO = require('socket.io'),
    twitter = require('twitter');

var port = process.env.PORT || '8080'; //Port used by Heroku for hosting

var app = express();

app.use('/', express.static(__dirname + '/public/'));
app.set('views', __dirname + '/views/');
app.engine('html', require('ejs').renderFile);

app.get('/', function(req, res) {
  res.render('main.html'); //only dashboard to render
});

app.get('*', function(req, res) {
  res.redirect('/'); //redirect to main page
});

var server = http.createServer(app).listen(port, function() { //create server
  console.log ('Started server, listening on port: ' + port);
});

var io = socketIO.listen(server); //Set up socket on this server

if (!config && !config.twitter) { //if not provided, take from Heroku environment variables
  config = {
    twitter : {
      consumer_key : process.env.CONSUMER_KEY,
      consumer_secret : process.env.CONSUMER_SECRET,
      access_token_key : process.env.ACCESS_TOKEN_KEY,
      access_token_secret : process.env.ACCESS_TOKEN_SECRET
    }
  }
}
var twitClient = new twitter(config.twitter);

io.on('connection', function(socket) {
  var userStream = null;

  socket.on('analyze', function(hashtag) {

    twitClient.stream('statuses/filter', {track: '#' + hashtag}, function(stream) {
      userStream = stream; //keep track of stream
      stream.on('data', function(data) {
        //console.log(data); //send to front end
        socket.emit(data); //new tweet
      });
    });

  });

  socket.on('disconnect', function() {
    if (userStream) { //distroy stream
      userStream.destroy();
      userStream = null; 
    }
  });

});
