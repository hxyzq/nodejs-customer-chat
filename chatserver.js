var io = require('socket.io')();

var onlineUsers = {}; //在线用户列表
var onlineStaffs = {}; //在线客服列表
var services = {}; //当前服务列表

//每隔5秒为用户分配一次客服
setInterval(server, 5000);

io.on('connection', function(socket) {
  // console.log(socket.id + ' connected');

  socket.on('user login', addUser);

  socket.on('staff login', addStaff);

  socket.on('admin login', adminServer);

  socket.on('disconnect', removeUserOrStaff);

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

  services[user.userid] = {
    userid: userid,
    staffid: staffid
  };

  //更新接入用户
  onlineStaffs[staff.staffid].socket.emit('add served user', {
    userid: onlineUsers[user.userid].userid,
    username: onlineUsers[user.userid].username
  });
  //向用户发送分配客服成功log
  onlineUsers[user.userid].socket.emit('log', onlineStaffs[staffid].staffname + '正在为您服务');

  console.log(user.username + '---->' + staff.staffname + ' successed!!');

  //更新正在服务列表
  updateServiceList();
  //更新在线用户列表
  updateUserList();
  //更新在线客服列表
  updateStaffList();

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
    userid: data.userid,
    username: data.username,
    isServed: false,
    socket: this
  };

  this.emit('log', '连接成功！' + data.username + ' 欢迎登陆！');
  this.emit('log', '正在为您分配客服，请稍等...');

  //更新在线用户列表
  updateUserList();
}

function addStaff(data) {

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

  //更新在线用户列表
  updateUserList();
  //更新在线客服列表
  updateStaffList();
  //更新正在服务列表
  updateServiceList();

  //更新index页面客服信息
  this.emit('update staffinfo',{
    staffid: data.staffid,
    staffname: data.staffname
  });

}

function removeUserOrStaff(data) {

  if (this.username) { //如果是用户退出

    console.log(this.username + '登出！');
    //更新onlineUsers列表
    var user = onlineUsers[this.userid];
    delete onlineUsers[this.userid];
    updateUserList();

    if (user.isServed === false) return; //如果该用户没有被服务，直接退出

    //移除接入用户
    onlineStaffs[services[user.userid].staffid].socket.emit('remove served user', {
      userid: user.userid,
      username: user.username
    });

    //对应客服服务数-1
    onlineStaffs[services[user.userid].staffid].currentserver --;
    updateStaffList();
    //更新services列表
    delete services[user.userid];
    updateServiceList();

  } else if (this.staffname) { //如果是客服退出

    console.log(this.staffname + '登出！');

    var staff = onlineStaffs[this.staffid];
    // if (staff.currentserver === 0) return; //如果该客服没有正在服务直接退出

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

  }

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
  var servicelist = [];
  for (userid in services) {
    // var userid = services[userid].userid;
    // var staffid = services[userid].staffid;
    servicelist.unshift(onlineUsers[services[userid].userid].username + '---->' + onlineStaffs[services[userid].staffid].staffname);
  }
  // servicelist.reverse();
  io.sockets.emit('update servicelist', servicelist);
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

}


function emitToUser(data) {
  console.log(getCurTime() + data.staffname + ': ' + data.message);

  var userid = data.userid;
  onlineUsers[userid].socket.emit('new message', {
    staffid: data.staffid,
    staffname: data.staffname,
    message: data.message
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
//管理系统查看页面服务
function adminServer(data) {

  // //将客服名和id存入socket
  // this.staffid = data.staffid;
  // this.staffname = data.staffname;

  console.log(data.adminname + '登入！');

  // onlineStaffs[data.staffid] = {
  //   staffid: data.staffid,
  //   staffname: data.staffname,
  //   maxserver: 5,
  //   currentserver: 0,
  //   socket: this
  // };

  //更新在线用户列表
  updateUserList();
  //更新在线客服列表
  updateStaffList();
  //更新正在服务列表
  updateServiceList();

  //更新index页面客服信息
  // this.emit('update staffinfo',{
  //   staffid: data.staffid,
  //   staffname: data.staffname
  // });

}