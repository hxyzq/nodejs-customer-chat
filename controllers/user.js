var models  = require('../models');

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