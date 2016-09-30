/**
 * Created by wch on 2016/9/30.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var StaffSchema = new Schema({
	staffname: String,
	password: String,
	realname: String,
	mobilephone: String,
	email: String,
	greetings: String,
	create_at: { type: Date, default: Date.now }
});

StaffSchema.index({ create_at: -1 });

mongoose.model('Staff', StaffSchema);