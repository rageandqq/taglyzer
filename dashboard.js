console.log('hello world');
var socket = io();

socket.emit('analyze', 'FIFA');

socket.on('tweet', function(data) {
  console.log(data);
  $('#tweet-list').append('<p>' + data['text'].toString() + '</p>');
});
