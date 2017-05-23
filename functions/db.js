var mysql = require('mysql');
var db = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'weekenders'
});

/*db.config.queryFormat = function (query, values) {
  if (!values) return query;
  return query.replace(/\:(\w+)/g, function (txt, key) {
    if (values.hasOwnProperty(key)) {
      return this.escape(values[key]);
    }
    return txt;
  }.bind(this));
};*/

db.connect(err => {err ? console.log(err) : '';});

module.exports = db;