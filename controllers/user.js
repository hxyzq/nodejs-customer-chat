var models = require('../models');
var moment = require('moment'); // date format

// show user chat page
exports.showChat = function(req, res, next) {
  console.log('user openid is ' + req.query.openid);

  models.PublicNumberFollower.findOne({
    attributes: ['nickname', 'headimgurl'],
    where: {
      openid: req.query.openid
    }
  }).then(function(user) {
    res.render('user', {
      userid    : req.query.openid,
      username  : user.dataValues.nickname,
      headimgurl: user.dataValues.headimgurl
    });
  });

}

// show user chat history page
exports.showHistory = function(req, res, next) {

  // 先查询用户信息
  models.PublicNumberFollower.findOne({
    attributes: ['headimgurl'],
    where: {
      openid: req.query.userid
    }
  }).then(function(user) {
    // 再查用户消息
    var userheadimgurl = user.dataValues.headimgurl;
    models.CallCenterEvent.findAll({
      where: {
        user_id: req.query.userid
      },
      include: [ models.CallCenterContent ]
    }).then(function(events) {
      res.render('userHistory', {
        moment: moment,
        events: events,
        userheadimgurl: userheadimgurl
      });
    });

  });

}

