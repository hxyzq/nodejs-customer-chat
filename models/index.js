/**
 * Created by wch on 2016/9/30.
 */

var mongoose = require('mongoose');
var config = require('../config');


mongoose.connect(config.db, {
	server: { poolSize: 20 }
}, function (err) {
	if (err) {
		console.log(err);
	}
});

require('./staff');
require('./user');


exports.Staff = mongoose.model('Staff');
exports.User = mongoose.model('User');


