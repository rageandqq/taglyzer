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
var twitClient = new twitter(config.twitter);

io.on('connection', function(socket) {
  var userStream = null;
  console.log('user connected');

  socket.on('analyze', function(hashtag) {
    console.log('user wants to analyze something');

    twitClient.stream('statuses/filter', {track: '#' + hashtag}, function(stream) {
      userStream  = stream; //keep track of stream
      stream.on('data', function(data) {
        console.log(data); //send to front end
      });
    });

  });

  socket.on('disconnect', function() {
    console.log('user disconnected');
    if (userStream) { //distroy stream
      userStream.destroy();
      userStream = null; 
    }
  });

});
