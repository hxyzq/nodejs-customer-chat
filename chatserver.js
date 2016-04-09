var models = require('./models');
var moment = require('moment'); // date format
var fs     = require('fs');
var ejs    = require('ejs');

var io = require('socket.io')();

var onlineUsers = {}; //在线用户列表
var onlineStaffs = {}; //在线客服列表
var services = {}; //当前服务列表

//每隔5秒为用户分配一次客服
setInterval(server, 5000);

io.on('connection', function(socket) {
  // console.log(socket.id + ' connected');

  socket.on('user login', addUser);

  socket.on('disconnect', removeUser);

  socket.on('staff login', addStaff);

  socket.on('staff logout', removeStaff);

  socket.on('chat server', chatServer);

  socket.on('user message', emitToStaff);

  socket.on('staff message', emitToUser);

});

exports.listen = function(server) {
  return io.listen(server);
};

//各类方法
function server() {
  var user;
  var staff;
  //获取当前未被服务的用户
  for (userid in onlineUsers) {
    if (onlineUsers[userid].isServed === false) {
      user = onlineUsers[userid];
      break;
    }
  }
  //获取当前可用的客服
  for (staffid in onlineStaffs) {
    if (onlineStaffs[staffid].maxserver - onlineStaffs[staffid].currentserver !==0) {
      staff = onlineStaffs[staffid];
      break;
    }
  }

  if (user === undefined || staff === undefined) return;

  onlineUsers[user.userid].isServed = true;
  onlineStaffs[staff.staffid].currentserver ++;

  //callcent_event表插入服务开始记录
  var id = Math.round(new Date().getTime()/1000); // 服务事件id
  models.CallCenterEvent.create({
      id        : id,
      user_id   : user.userid,
      staff_id  : staff.staffid,
      start_time: new Date(),
  });

  services[user.userid] = {
    id       : id,
    userid   : user.userid,
    username : user.username,
    staffid  : staff.staffid,
    staffname: staff.staffname
  };

  var templateString = fs.readFileSync('../views/templates/chatBox.ejs', 'utf-8');
  var html = ejs.render(templateString, {
    user  : user,
  });

  //更新接入用户
  onlineStaffs[staff.staffid].socket.emit('add served user', {
    userid  : onlineUsers[user.userid].userid,
    username: onlineUsers[user.userid].username,
    chatBox : html
  });
  //向用户发送分配客服成功log
  onlineUsers[user.userid].socket.emit('log', onlineStaffs[staffid].staffname + '正在为您服务');

  console.log(user.username + '---->' + staff.staffname + ' successed!!');

  // 更新正在服务列表
  updateServiceList();
  // 更新在线用户列表
  updateUserList();
  // 更新在线客服列表
  updateStaffList();
  // 更新wait page页面的待接入用户列表
  updateWaitUserList();
}

//客服聊天服务
function chatServer(data) {

  var staffid = data.staffid;
  var userid = data.userid;

  //保存当前客服聊天的socket到services列表中
  services[userid].staffsocket = this;

  //向客服发送开始服务log
  this.emit('log', '开始服务： ' + onlineUsers[userid].username);
  //向用户发送分配客服成功log
  onlineUsers[userid].socket.emit('log', onlineStaffs[staffid].staffname + '正在为您服务');
}

function addUser(data) {

  //将用户名和id存入socket
  this.userid = data.userid;
  this.username = data.username;

  console.log(data.username + '登入！');

  //将用户加入在线用户列表
  onlineUsers[data.userid] = {
    userid     : data.userid,
    username   : data.username,
    isServed   : false,
    requesttime: new Date(),
    socket     : this
  };

  this.emit('log', '连接成功！' + data.username + ' 欢迎登陆！');
  this.emit('log', '正在为您分配客服，请稍等...');

  // 更新在线用户列表
  updateUserList();
  // 更新wait page页面的待接入用户列表
  updateWaitUserList();
}

function addStaff(data) {
  // 如果客服不存在 新增一个客服
  if (onlineStaffs[data.staffid] === undefined) {
    //将客服名和id存入socket
    this.staffid = data.staffid;
    this.staffname = data.staffname;

    console.log(data.staffname + '登入！');

    onlineStaffs[data.staffid] = {
      staffid: data.staffid,
      staffname: data.staffname,
      maxserver: 2,
      currentserver: 0,
      socket: this
    };

    // 更新在线用户列表
    updateUserList();
    // 更新在线客服列表
    updateStaffList();
    // 更新正在服务列表
    updateServiceList();
    // 更新wait page页面的待接入用户列表
    updateWaitUserList();

  } else {
  // 客服重连 更新socket add chatbox
    onlineStaffs[data.staffid].socket = this;
    // 重载chatBox
    for (userid in services) {
      if (services[userid].staffid === data.staffid) {

        var templateString = fs.readFileSync('../views/templates/chatBox.ejs', 'utf-8');
        var html = ejs.render(templateString, {
          user  : onlineUsers[userid],
          moment: moment
        });
        onlineStaffs[data.staffid].socket.emit('add served user', {
          userid  : onlineUsers[userid].userid,
          username: onlineUsers[userid].username,
          chatBox : html
        });

      }
    }
    // 重载之前的聊天记录
    for (userid in services) {
      if (services[userid].staffid === data.staffid) {

        // TODO 查之前的聊天记录
        models.CallCenterContent.findAll({
          where: {
            CallCenterEventId: services[userid].id
          }
        }).then(function(contents) {

          var templateString = fs.readFileSync('../views/templates/chatMessages.ejs', 'utf-8');
          var html = ejs.render(templateString, {
            username : services[userid].username,
            staffname: services[userid].staffname,
            contents : contents,
            moment   : moment
          });

          if (contents[0] === undefined) return; // 如果之前没有聊天记录
          var eventid = contents[0].dataValues.CallCenterEventId;
          // 通过聊天记录的CallCenterEventId在services中查userid
          for (i in services) {
            if (services[i].id == eventid) {
              onlineStaffs[data.staffid].socket.emit('load chatHistory', {
                userid     : services[i].userid,
                chatHistory: html
              });

            }
          }

        });

      }
    }

    // 更新wait page页面的正在服务用户列表
    updateServiceList();
    // 更新wait page页面的待接入用户列表
    updateWaitUserList();
  }

}

function removeUser(data) {

  if (this.username) { //如果是用户退出

    console.log(this.username + '登出！');
    //更新onlineUsers列表
    var user = onlineUsers[this.userid];
    delete onlineUsers[this.userid];
    updateUserList();

    //移除接入用户
    onlineStaffs[services[user.userid].staffid].socket.emit('remove served user', {
      userid: user.userid,
      username: user.username
    });

    //对应客服服务数-1
    onlineStaffs[services[user.userid].staffid].currentserver --;
    updateStaffList();

    // callcent_event表插入服务结束记录
    models.CallCenterEvent.update({
      end_time: new Date()
    }, {
      where: {
        id: services[user.userid].id
      }
    });

    //更新services列表
    delete services[user.userid];
    updateServiceList();

    // 更新wait page页面的待接入用户列表
    updateWaitUserList();
  }

}

function removeStaff(data) {

  console.log(data.staffname + '登出！');

  var staff = onlineStaffs[data.staffid];
  if (staff === undefined) return;

  //更新用户的被服务状态
  for (userid in services) {
    if (services[userid].staffid == staff.staffid) {
      onlineUsers[services[userid].userid].isServed = false;
      updateUserList();
    }
  }
  //更新services列表
  for (userid in services) {
    if (services[userid].staffid == staff.staffid) {
      delete services[userid];
      updateServiceList();
    }
  }

  //更新onlineStaffs列表(这一步必须最后进行)
  delete onlineStaffs[staff.staffid];
  updateStaffList();

  // 更新wait page页面的待接入用户列表
  updateWaitUserList();
}

function updateUserServed(userid) {
  for (var i = onlineUsers.length - 1; i >= 0; i--) {
    if (onlineUsers[i].userid === userid) {
        onlineUsers[i].isServed = false;
    }
  }
}

function updateUserList(data) {
  var userlist = [];
  for (userid in onlineUsers) {
    userlist.unshift(onlineUsers[userid].username + '----' + onlineUsers[userid].isServed);
  }
  // userlist.reverse();
  io.sockets.emit('update userlist', userlist);
}

function updateStaffList(data) {
  var stafflist = [];
  for (staffid in onlineStaffs) {
    stafflist.unshift(onlineStaffs[staffid].staffname + '----' + onlineStaffs[staffid].currentserver);
  }
  // stafflist.reverse();
  io.sockets.emit('update stafflist', stafflist);
}

function updateServiceList(data) {
  // var servicelist = [];
  // for (userid in services) {
  //   // var userid = services[userid].userid;
  //   // var staffid = services[userid].staffid;
  //   servicelist.unshift(onlineUsers[services[userid].userid].username + '---->' + onlineStaffs[services[userid].staffid].staffname);
  // }

  var templateString = fs.readFileSync('../views/templates/serviceTableTbodyTrs.ejs', 'utf-8');
  var html = ejs.render(templateString, {
    services    : services,
    onlineUsers : onlineUsers,
    onlineStaffs: onlineStaffs,
    moment      : moment
  });

  io.sockets.emit('update servicelist', html);
}

function updateWaitUserList(data) {

  var templateString = fs.readFileSync('../views/templates/waitUserTableTbodyTrs.ejs', 'utf-8');
  var html = ejs.render(templateString, {
    onlineUsers : onlineUsers,
    moment      : moment
  });

  io.sockets.emit('update waituserlist', html);

}

function emitToStaff(data) {
  console.log(getCurTime() + data.username + ': ' + data.message);

  var staffid = services[data.userid].staffid;
  // services[data.userid].staffsocket.emit('new message', {
  //   userid: data.userid,
  //   username: data.username,
  //   message: data.message
  // });

  onlineStaffs[staffid].socket.emit('new message', {
    userid: data.userid,
    username: data.username,
    message: data.message
  });

  // callcenter_content表中插入消息内容记录
  models.CallCenterContent.create({
      CallCenterEventId: services[data.userid].id,
      speak_time       : new Date(),
      speaker          : 0,
      content           : data.message
  });

}


function emitToUser(data) {
  console.log(getCurTime() + data.staffname + ': ' + data.message);

  onlineUsers[data.userid].socket.emit('new message', {
    staffid: data.staffid,
    staffname: data.staffname,
    message: data.message
  });

  // callcenter_content表中插入消息内容记录
  models.CallCenterContent.create({
      CallCenterEventId: services[data.userid].id,
      speak_time       : new Date(),
      speaker          : 1,
      content           : data.message
  });
}

function getCurTime(){
  var t = new Date(),
    M = t.getMonth() + 1,
    D = t.getDate(),
    H = t.getHours(),
    m = t.getMinutes(),
    s = t.getSeconds();

  return ['[', M, '-', D, ' ', H, ':', m, ':', s, ']'].join('');
}
