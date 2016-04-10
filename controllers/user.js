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

// show user chat history
exports.showHistory = function(req, res, next) {

  // models.CallCenterContent.findAll({
  //   where: {

  //   }
  // })


}

// exports.showChatHistory = function(req, res, next) {

//   models.CallCenterContent.findAll({
//     where: {
//       CallCenterEventId: req.body.eventid
//     }
//   }).then(function(contents) {

//     var templateString = fs.readFileSync('../views/templates/chatHistory.ejs', 'utf-8');
//     var html = ejs.render(templateString, {
//       moment   : moment,
//       contents : contents,
//       username : '用户',
//       staffname: req.session.staffname
//     });
//     res.json({ chatHistory: html });

//   });

// }