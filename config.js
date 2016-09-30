/**
 * config
 */

var path = require('path');

var config = {

  name: '微尚客服系统', // 网站名字
  description: '', // 网站的描述

	// mongod配置
	db: 'mongodb://localhost/customer_chat',

	session_secret: 'customer_chat_secret'

};

module.exports = config;