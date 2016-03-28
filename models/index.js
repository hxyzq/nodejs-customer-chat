"use strict";

var fs        = require("fs");
var path      = require("path");
var Sequelize = require("sequelize");
// var env       = process.env.NODE_ENV || "development";
// var config    = require(path.join(__dirname, '..', 'config', 'config.json'))[env];
var db        = {};

// var sequelize = new Sequelize(config.database, config.username, config.password, config);
var sequelize = new Sequelize('fashion_development', 'root_dev', 'fashion123', {
  host: '139.196.184.225',
  dialect: 'mysql',
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
