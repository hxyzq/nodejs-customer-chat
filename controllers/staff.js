var config = require('../config');
var models  = require('../models');

// show staff chat page
exports.showChat = function(req, res, next) {
  res.render('chat', {
    title: config.name,
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff wait page
exports.showWait = function(req, res, next) {
  res.render('wait', {
    title: config.name,
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff history page
exports.showHistory = function(req, res, next) {
  res.render('history', {
    title: config.name,
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff profile page
exports.showProfile = function(req, res, next) {
  // 根据account_info_id查platform_staff_info表
  models.PlatformStaff.findOne({
      attributes: ['real_name', 'telephone', 'mobilephone', 'email'],
      where: {
        account_info_id: req.session.staffid
      }
  }).then(function(user) {

    res.render('profile', {
      title    : config.name,
      staffid  : req.session.staffid,
      staffname: req.session.staffname,
      staff: {
        realname   : user.dataValues.real_name,
        telephone  : user.dataValues.telephone,
        mobilephone: user.dataValues.mobilephone,
        email      : user.dataValues.email
      }
    });

  });
}

// set staff profile
exports.setProfile = function(req, res, next) {

  var action = req.body.action;
  if (action === 'change_profile') {

    var realname    = req.body.realname;
    var telephone   = req.body.telephone;
    var mobilephone = req.body.mobilephone;
    var email       = req.body.email;

    // 更新platform_staff_info表
    models.PlatformStaff.update({
      real_name  : realname,
      telephone  : telephone,
      mobilephone: mobilephone,
      email      : email
    }, {
      where: {
        account_info_id: req.session.staffid
      }
    }).then(function(result) {
      // console.log('result' + ' ' + result);
      res.redirect('/profile?save=success');
    });
  }
  if (action === 'change_password') {

  }

}