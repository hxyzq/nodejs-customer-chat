"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
var db        = {};
var config    = require('../config');

// var sequelize = new Sequelize(config.database, config.username, config.password, config);
var sequelize = new Sequelize(config.db.database, config.db.username, config.db.password, {
  host: config.db.host,
  dialect: 'mysql',
  timezone : '+08:00' // set timezone if not timestamp delay 8 hours
});

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf(".") !== 0) && (file !== "index.js");
  })
  .forEach(function(file) {
    var model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach(function(modelName) {
  if ("associate" in db[modelName]) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
