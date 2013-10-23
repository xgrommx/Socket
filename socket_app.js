var io = require('socket.io').listen(9999);

io.sockets.on('connection', function (socket) {

  socket.emit('emit_event', { data: "it'is emit event" });

  socket.on('on_event', function (data) {
    
  });

});