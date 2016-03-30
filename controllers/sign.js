var models  = require('../models');

var crypto = require('crypto'); //md5 require

// show staff login page
exports.showLogin = function (req, res, next) {
  res.render('login');
};

// handle staff login
exports.login = function (req, res, next) {

  var staffname = req.body.staffname;
  var password = req.body.password;

  if (!staffname || !password) {
    res.status(422);
    return res.render('login', { error: '信息不完整' });
  } else {
    // 根据staffname查找account_info表获取客服id user_name password
    models.AccountInfo.findOne({
        attributes: ['id', 'user_name', 'password'],
        where: {
          user_name: staffname
        }
    }).then(function(user) {
      if (user === null) {
        res.render('login', { error: '用户不存在' });
      } else {
        //md5
        var md5 = crypto.createHash('md5');
        password = md5.update(password).digest('hex');

        if (user.dataValues.password != password) {
          res.render('login', { error: '密码错误' });
        } else {

          var account_info_id = user.dataValues.id;
          models.UserRole.findAll({ // 根据客服id查找user_role表获取客服system_role_id来判断用户是否具有客服权限
              attributes: ['account_info_id', 'system_role_id'],
              where: {
                account_info_id: account_info_id
              }
          }).then(function(roles) {
            var isCustomer = false;
            for (role in roles) {
              if (roles[role].dataValues.system_role_id == '8a2ef4b3538f161101538f2936bf0007') { //system_role_id为8a2ef4b3538f161101538f2936bf0007是system_role表中的客服id
                isCustomer = true;
              }
            }

            if (!isCustomer) {
              res.render('login', { error: '该用户没有客服权限' });
            } else {
              req.session.staffid = user.dataValues.id;
              req.session.staffname = user.dataValues.user_name;
              res.redirect('/');
            }

          });

        }
      }
    });
  }

};

// staff logout
exports.logout = function (req, res, next) {
  req.session.destroy();
  res.redirect('/');
};