var app = require('http').createServer(handler).listen(9999),
	io = require('socket.io').listen(app);

function handler (req, res) {
	res.writeHead(200);
	res.end('OK ServerJS');
}

io.sockets.on('connection', function (socket) {

	console.log('Connection received', socket);


	setInterval(function() {
		socket.emit('on_event', { data: "it'is emit event", time: new Date() });
	}, 5000);

	socket.on('emit_event', function (data, fn) {
		console.log(data);
		console.log(fn);
	});

});