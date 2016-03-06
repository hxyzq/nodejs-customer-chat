var io = require('socket.io')();

var onlineUsers = []; //在线用户列表
var onlineStaffs = []; //在线客服列表
var services = []; //当前服务列表

//每隔5秒为用户分配一次客服
setInterval(server, 5000);

io.on('connection', function(socket) {
  // console.log(socket.id + ' connected');

  socket.on('user login', addUser);

  socket.on('staff login', addStaff);

  socket.on('disconnect', removeUserOrStaff);

});

exports.listen = function(server) {
  return io.listen(server);
};


//各类方法
function server() {

  if (onlineUsers.length === 0 || onlineStaffs.length === 0)
    return;

  var userfind = false; //用户找到标志
  var stafffind = false; //客服找到标志
  //获取当前未被服务的用户
  var i;
  for (i = onlineUsers.length - 1; i >= 0; i--) {
    if (onlineUsers[i].isServed === false) {
      userfind = true;
      break;
    }
  }

  //获取当前可用的客服
  var j;
  for (j = onlineStaffs.length - 1; j >= 0; j--) {
    if (onlineStaffs[j].maxserver - onlineStaffs[j].currentserver != 0) {
      stafffind = true;
      break;
    }
  }

  if (userfind === false || stafffind === false)
    return;

  onlineUsers[i].isServed = true;
  onlineStaffs[j].currentserver ++;

  var service = {
    user: onlineUsers[i],
    staff: onlineStaffs[j],
  }
  services.unshift(service);

  console.log(onlineUsers[i].username + '---->' + onlineStaffs[j].staffname + ' successed!!');

  //更新index页面正在服务列表
  var servicelist = [];
  for (var i = services.length - 1; i >= 0; i--) {
    servicelist.unshift(services[i].user.username + '---->' + services[i].staff.staffname);
  }
  io.sockets.emit('update servicelist', servicelist);

}

function addUser(data) {

  //将用户名和id存入socket
  this.userid = data.id;
  this.username = data.name;

  console.log(data.name + '登入！');

  //将用户加入在线用户列表
  var user = {
    userid: data.id,
    username: data.name,
    isServed: false, //是否被服务
    socket: this
  };
  onlineUsers.unshift(user);

  this.emit('log', '连接成功！' + data.name + ' 欢迎登陆！');

  //更新index页面在线用户列表
  var userlist = [];
  for (var i = onlineUsers.length - 1; i >= 0; i--) {
    userlist.unshift(onlineUsers[i].username);
  }
  this.broadcast.emit('update userlist', userlist);

}

function addStaff(data) {

  //将客服名和id存入socket
  this.staffid = data.id;
  this.staffname = data.name;

  console.log(data.name + '登入！');

  //将客服加入在线客服列表
  var staff = {
    staffid: data.id,
    staffname: data.name,
    maxserver: 2, //最多服务人数
    currentserver: 0, //当前服务人数
    socket: this
  };
  onlineStaffs.unshift(staff);

  //更新index页面在线用户列表
  var userlist = [];
  for (var i = onlineUsers.length - 1; i >= 0; i--) {
    userlist.unshift(onlineUsers[i].username);
  }
  io.sockets.emit('update userlist', userlist);

  //更新index页面在线客服列表
  var stafflist = [];
  for (var i = onlineStaffs.length - 1; i >= 0; i--) {
    stafflist.unshift(onlineStaffs[i].staffname);
  }
  io.sockets.emit('update stafflist', stafflist);

  //更新index页面正在服务列表
  var servicelist = [];
  for (var i = services.length - 1; i >= 0; i--) {
    servicelist.unshift(services[i].user.username + '---->' + services[i].staff.staffname);
  }
  io.sockets.emit('update servicelist', servicelist);

}

function removeUserOrStaff(data) {

  if (this.username) { //如果是用户退出

    console.log(this.username + '登出！');
    //更新onlineUsers列表
    var user;
    for (var i = onlineUsers.length - 1; i >= 0; i--) {
      if (onlineUsers[i].userid == this.userid) {
        user = onlineUsers[i];
        onlineUsers.splice(i, 1);
      }
    }
    this.broadcast.emit('remove user', {
      name: this.username
    });
    if (user.isServed === false) return; //如果该用户没有被服务，直接退出

    //更新services列表
    var service;
    var tmp;
    for (var i = services.length - 1; i >= 0; i--) {
      if (services[i].user.userid === user.userid) {
        tmp = services[i];
        services.splice(i, 1);
        service = tmp.user.username + '---->' + tmp.staff.staffname;
      }
    }
    io.sockets.emit('remove service', {
      service: service
    });

    //对应客服服务数-1
    for (var i = onlineStaffs.length - 1; i >= 0; i--) {
      if (onlineStaffs[i].staffid === tmp.staff.staffid) {
        onlineStaffs[i].currentserver --;
      }
    }

  } else {

    console.log(this.staffname + '登出！');

    //更新onlineStaffs列表
    var staff;
    for (var i = onlineStaffs.length - 1; i >= 0; i--) {
      if (onlineStaffs[i].staffid === this.staffid) {
        staff = onlineStaffs[i];
        onlineStaffs.splice(i, 1);
      }
    }
    io.sockets.emit('remove staff', {
      name: this.staffname
    });

    //更新services列表
    for (var i = services.length - 1; i >= 0; i--) {

      if (services[i].staff.staffid === staff.staffid){
        var service = services[i].user.username + '---->' + services[i].staff.staffname;
        updateUserServed(services[i].user.userid); //更新用户的被服务状态
        services.splice(i, 1);
        io.sockets.emit('remove service', {
          service: service
        });
      }

    }

  }

}

function updateUserServed(userid) {
  for (var i = onlineUsers.length - 1; i >= 0; i--) {
    if (onlineUsers[i].userid === userid) {
        onlineUsers[i].isServed = false;
    }
  }
}