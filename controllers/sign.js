var config = require('../config');
var models  = require('../models');
var Staff = models.Staff;

var crypto = require('crypto'); //md5 require

// show staff login page
exports.showLogin = function (req, res, next) {
  res.render('login', {
    title: '登陆 - ' + config.name,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });

};

// handle staff login
exports.login = function (req, res, next) {

  var staffname = req.body.staffname;
  var password = req.body.password;

  if (!staffname || !password) {
    res.status(422);
    req.flash('error', '信息不完整!');
    return res.redirect('/');
  } else {

    Staff
      .findOne({ 'staffname': staffname })
      .exec(function (err, staff) {
        if (err) {
          req.flash('error', err.message);
          res.status(500);
          return res.redirect('/');
        } else {
          //md5
          var md5 = crypto.createHash('md5');
          password = md5.update(password).digest('hex');

          if (staff.staffname === staffname && staff.password === password) {
            req.session.staffid = staff._id;
            req.session.staffname = staff.staffname;
            res.redirect('/');
          } else {
            req.flash('error', '用户名或者密码错误!');
            return res.redirect('/');
          }

        }
      })

  }

};

// staff logout
exports.logout = function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
};