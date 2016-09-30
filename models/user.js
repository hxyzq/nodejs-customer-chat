/**
 * Created by wch on 2016/9/30.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;


var UserSchema = new Schema({
	nickname: String,
	email: String,
	mobilephone: String,
	create_at: { type: Date, default: Date.now }
});

UserSchema.index({ create_at: -1 });

mongoose.model('User', UserSchema);