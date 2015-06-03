console.log('hello world');
var socket = io();

socket.emit('analyze', 'FIFA');
