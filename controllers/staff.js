var ejs    = require('ejs');
var fs     = require('fs');
var crypto = require('crypto'); // md5 require
var moment = require('moment'); // date format

var config = require('../config');
var models = require('../models');
var Staff = models.Staff;

// show staff chat page
exports.showChat = function(req, res, next) {
  res.render('chat', {
    title: config.name,
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
};

// show staff wait page
exports.showWait = function(req, res, next) {
  res.render('wait', {
    title: config.name,
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
};

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
};

// show staff profile page
exports.showProfile = function(req, res, next) {

  Staff
	  .findOne({ '_id': req.session.staffid })
	  .exec(function (err, staff) {
			if (err) {
				req.flash('error', err.message);
				res.status(500);
				return res.redirect('/');
			} else {
				res.render('profile', {
					title    : config.name,
					staffid  : req.session.staffid,
					staffname: req.session.staffname,
					staff    : staff,
					success  : req.flash('success').toString(),
					error    : req.flash('error').toString(),
					changepasssucc: req.flash('changepasssucc').toString(),
					changepasserr : req.flash('changepasserr').toString()
				});

			}
	  });
};

// set staff profile
exports.setProfile = function(req, res, next) {

  var action = req.body.action;
  if (action === 'change_profile') {

	  var update = {
			realname:    req.body.realname,
		  mobilephone: req.body.mobilephone,
		  email:       req.body.email,
		  greetings:   req.body.greetings
	  };
		var options = {
			new: true
		};
	  Staff.findByIdAndUpdate(req.session.staffid, update, options, function (err, staff) {
		  if (err) {
		  	req.flash('error', err.message);
		  } else {
			  req.flash('success', '保存成功!');
		  }
		  return res.redirect('/profile');
	  });

  }

  if (action === 'change_password') {
    var oldpassword = req.body.oldpassword;
    var newpassword = req.body.newpassword;

	  //md5
	  var md5 = crypto.createHash('md5');
	  oldpassword = md5.update(oldpassword).digest('hex');
	  md5 = crypto.createHash('md5');
	  newpassword = md5.update(newpassword).digest('hex');

	  Staff.findById(req.session.staffid, function (err, staff) {
		  if (err) {
			  req.flash('changepasserr', err.message);
			  return res.redirect('/profile');
		  } else {

			  if (oldpassword !== staff.password) {
				  req.flash('changepasserr', '当前密码错误!');
				  return res.redirect('/profile');
			  } else {
				  staff.password = newpassword;
				  staff.save(function (err) {
					  if (err) {
						  req.flash('changepasserr', err.message);
						  return res.redirect('/profile');
					  } else {
					  	req.flash('changepasssucc', '密码已修改!');
						  return res.redirect('/profile');
					  }
				  });
			  }

		  }
	  });

  }

};

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