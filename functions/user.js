let db = require('./db.js');

module.exports = {
	set: (id = 'new', callback, data = {}) => {

		let q = 'INSERT INTO user (id) VALUES (NULL)';

		if(id != 'new') {
			q = 'UPDATE user SET ? WHERE ?';
			data = [data, {id : id}];
		}

		db.query(q, data, (err, res, field) => {

			if(err) {
				throw err;
				return;
			}
			else {
				return callback(res);
			}

		});
		
	},
	get: (id = '*', callback) => {

		let q = 'SELECT * FROM user';
		let data = {}

		if(id != '*') {
			q += ' WHERE ?';
			data = {id : id};
		}

		db.query(q, data, (err, res, field) => {

			if(err) {
				throw err;
				return;
			}
			else {
				return callback(res);
			}

		});

	},
	del: (id = '', callback) => {

		if(id == '') {
			console.log('No user ID provided');
			return;
		}	

		let q = 'DELETE FROM user WHERE ?';
		let data = {id : id};

		db.query(q, data, (err, res, field) => {

			if(err) {
				throw err;
				return;
			}
			else {
				return callback(res);
			}

		});

	}
};