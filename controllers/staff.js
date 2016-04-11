var ejs    = require('ejs');
var fs     = require('fs');
var crypto = require('crypto'); // md5 require
var moment = require('moment'); // date format

var config = require('../config');
var models = require('../models');

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
  // 查当前staff的所有聊天记录
  models.CallCenterEvent.findAll({
    where: {
      staff_id: req.session.staffid
    }
  }).then(function(events) {
    res.render('history', {
      title: config.name,
      staffid: req.session.staffid,
      staffname: req.session.staffname,
      events: events,
      moment: moment
    });

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
    var message = {};
    if (req.query.save === 'success') {
      message.success = '保存成功';
    }
    if (req.query.save === 'fail') {
      message.error = '保存失败'
    }
    if (req.query.changepass === 'success') {
      message.changepasssucc = '密码已修改';
    }
    if (req.query.changepass == 'fail') {
      message.changepasserr = '当前密码错误';
    }

    res.render('profile', {
      title    : config.name,
      staffid  : req.session.staffid,
      staffname: req.session.staffname,
      message  : message,
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
      if (result) {
        res.redirect('/profile?save=success');
      } else {
        res.redirect('/profile?save=fail');
      }
    });
  }
  if (action === 'change_password') {
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;
    // 根据staffid查account_info表获取password
    models.AccountInfo.findOne({
        attributes: ['password'],
        where: {
          id: req.session.staffid
        }
    }).then(function(user) {
      console.log(user.dataValues);
      //md5
      var md5 = crypto.createHash('md5');
      oldpassword = md5.update(oldpassword).digest('hex');

      if (oldpassword !== user.dataValues.password) {
        res.redirect('/profile?changepass=fail');
      } else {
        var md5 = crypto.createHash('md5');
        newpassword = md5.update(newpassword).digest('hex');
        // 更新account_info表的password
        models.AccountInfo.update({
          password: newpassword
        }, {
          where: {
            id: req.session.staffid
          }
        }).then(function() {
          res.redirect('/profile?changepass=success');
        });
      }

    });

  }

}

exports.showChatHistory = function(req, res, next) {

  models.CallCenterContent.findAll({
    where: {
      CallCenterEventId: req.body.eventid
    },
    include: [ models.CallCenterEvent ]
  }).then(function(contents) {

    var templateString = fs.readFileSync('../views/templates/chatHistory.ejs', 'utf-8');
    var html = ejs.render(templateString, {
      moment   : moment,
      contents : contents,
      username : req.body.username,
      staffname: req.body.staffname
    });
    res.json({ chatHistory: html });

  });

}

exports.deleteChatHistory = function(req, res, next) {
  var eventid = req.body.eventid
  console.log('eventid: ' + eventid);
  // 先删content
  models.CallCenterContent.destroy({
    where: {
      CallCenterEventId: eventid
    }
  }).then(function () {
    // 再删event
    models.CallCenterEvent.destroy({
      where: {
        id: eventid
      }
    }).then(function (result) {
      res.json({ result: result }); // 返回删除结果
    });

  });

}

exports.downloadChatHistroy = function(req, res, next) {

  models.CallCenterEvent.findOne({
    where: {
      id: req.query.eventid
    },
    include: [ models.CallCenterContent ]
  }).then(function(event) {

    // 生成消息记录文件
    var txt = '消息记录\r\n\r\n';
    txt += '================================================================\r\n';
    txt += '用户名:' + event.dataValues.user_name + '    客服名:' + event.dataValues.staff_name + '\r\n';
    txt += '开始时间:' + moment(event.dataValues.start_time).format('YYYY-MM-DD HH:mm:ss');
    txt += '    结束时间:' + moment(event.dataValues.end_time).format('YYYY-MM-DD HH:mm:ss') + '\r\n';
    txt += '================================================================\r\n\r\n';
    for (i in event.dataValues.CallCenterContents) {
      // console.log(event.dataValues.CallCenterContents[i].dataValues);
      txt += moment(event.dataValues.CallCenterContents[i].dataValues.speak_time).format('YYYY-MM-DD HH:mm:ss') + ' ';
      txt += (event.dataValues.CallCenterContents[i].dataValues.speaker ? event.dataValues.staff_name : event.dataValues.user_name) + '\r\n';
      txt += event.dataValues.CallCenterContents[i].dataValues.content + '\r\n\r\n';
    }
    var filename = '../tmp/history/' + event.dataValues.user_name + '_' + event.dataValues.id + '.txt';
    fs.writeFile(filename, txt, function (err) {
        if (err) {
          throw err;
          res.send(err);
        }
        console.log(filename + ' created!');
        res.download(filename);
    });

  });

}

exports.showHistoryList = function(req, res, next) {
  // console.log(req.body);

  var start = moment(req.body.startDate).format('YYYY-MM-DD HH:mm:ss');
  var end = moment(req.body.endDate).format('YYYY-MM-DD HH:mm:ss');
  // console.log(start);
  // console.log(end);

  // 查daterange内的聊天记录
  models.CallCenterEvent.findAll({
    where: {
      staff_id: req.session.staffid,
      start_time: {
        $between: [start, end],
      }
    }
  }).then(function(events) {
    // for (i in events) {
    //   console.log(events[i].dataValues);
    // }

    var templateString = fs.readFileSync('../views/templates/historyList.ejs', 'utf-8');
    var html = ejs.render(templateString, {
      moment   : moment,
      events   : events,
      staffname: req.session.staffname
    });
    res.json({ historyList: html });

  });

}