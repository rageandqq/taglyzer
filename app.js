var express = require('express'),
    http = require('http'),
    config = require('./config'),
    socketIO = require('socket.io'),
    twitter = require('twitter');

var port = process.env.PORT || '8080'; //Port used by Heroku for hosting

var app = express();

app.use('/', express.static(__dirname + '/public/'));
app.use('/bower_components',  express.static(__dirname + '/bower_components/'));

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

/*
if (config == null || config.twitter == null) { //if not provided, take from Heroku environment variables
  config = {
    twitter : {
      consumer_key : process.env.CONSUMER_KEY,
      consumer_secret : process.env.CONSUMER_SECRET,
      access_token_key : process.env.ACCESS_TOKEN_KEY,
      access_token_secret : process.env.ACCESS_TOKEN_SECRET
    }
  }
}*/

var twitClient = new twitter(config.twitter);

var killStream = function(stream) {
  stream.destroy();
  stream = null;
  return stream;
}

io.on('connection', function(socket) {
  var userStream = null;

  socket.on('analyze', function(hashtag) {

    if (userStream != null) {
      userStream = killStream(userStream);
    }
    
    twitClient.stream('statuses/filter', {track: '#' + hashtag}, function(stream) {
      userStream = stream; //keep track of stream
      stream.on('data', function(data) {
        socket.emit('tweet', data); //new tweet
      });
    });

  });

  socket.on('disconnect', function() {
    if (userStream) { //destroy stream
      userStream = killStream(userStream);
    }
  });

});
