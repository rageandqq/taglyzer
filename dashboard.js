$(document).ready(function() {
  var loading = false;
  var socket = io();

  socket.on('tweet', function(data) {
    console.log(data);
    if (loading) {
      loading = false;
      $('#tweet-list').empty();
    }
    $('#tweet-list').append('<p>' + data['text'].toString() + '</p>');
  });

  var searchHandler = function() {
    var val = $('#search').val();
    console.log('search for: ' + val);
    socket.emit('analyze',val);
    $('#tweet-list')
      .empty()
      .append('<h1> LOADING </h1>');
    loading = true;
  };

  $('#search-button').click(searchHandler);
});
