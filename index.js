var $ = a => {console.log(a)}

var express		= require('express');
var app			= express();
var fs			= require("fs");
var server 		= require('http').Server(app);
var io			= require('socket.io').listen(server);
var ss			= require('socket.io-stream');
var morgan		= require('morgan');
var mysql		= require('mysql');
var _ 			= require('underscore');
var ejs			= require('ejs');
var path		= require('path');

var db			= require('./functions/db.js');
var user		= require('./functions/user.js');

app.set('view engine', 'ejs');

server.listen(3000, function () {
	console.log('serving on port 3000 :D');
});

app.use(morgan('tiny'));
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

io.on('connection', function (socket) {

	socket.on('disconnect', function () {
		io.emit('user disconnected');
	});

	console.log(socket.id);

	/*
	//SEND
	socket.emit('topic', { key: 'value' });

	//RECEIVE
	socket.on('topic', function (data) {
		console.log(data);
	});
	*/

	socket.on('request.page', req => {

		ejs.renderFile(__dirname + '/views/template.ejs', req, function(err, data) {
			
			if(err) return;

			socket.emit('respose.page', { page: req.page, content: data });

		});

		
	});

	socket.on('request.user', req => {

		switch(req.type) {

			case 'new':

				user.set(req.id, res => {
					user.get(res.insertId, res => {
						socket.emit('respose.user', {type : 'new', user : res[0]});
					});
				});
				break;

			case 'get':

				user.get(req.id, res => {
					socket.emit('respose.user', {type : 'get', user : res[0]});
				});
				break;

			case 'set':

				user.set(req.id, res => {
					socket.emit('respose.user', {type : 'set', saved : res.affectedRows > 0 ? true : false});
				},
				req.data);
				break;

			case 'del':

				user.del(req.id, res => {

					let isDeleted = false;

					if(res.affectedRows == 1) {
						isDeleted = true;
					}

					socket.emit('respose.user', {type : 'del', isDeleted : isDeleted});
				});
				break;

			case 'all':

				user.get('*', res => {

					for(var row in res) {

						delete res[row]['socket_id'];
						delete res[row]['auth_level'];
						delete res[row]['geolocation'];

					}

					socket.emit('respose.user', {type : 'all', users : res});
				});
				break;
		}

	});

	socket.on('request.post', () => {

		//socket.emit('respose.user', {type : 'all', users : res});

	});

	ss(socket).on('postcard', function(stream, data) {
		var filename = path.basename(data.name);
		stream.pipe(fs.createWriteStream(filename));
	});

});
