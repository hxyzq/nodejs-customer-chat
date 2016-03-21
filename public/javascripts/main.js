$(function() {
  alert('test');
  var socket = io();

  var staffid = Math.random()*900000|0+100000; //生成6位随机数
  var staffname = '客服' + staffid;

  socket.on('connect', function() {

    socket.emit('staff login', {
      staffid: staffid,
      staffname: staffname
    });

  });

  //更新当前客服信息
  socket.on('update staffinfo', function(data) {
    $("#staffname").text(data.staffname);
  });

  //更新接入用户
  socket.on('add served user', function(data) {
    //增加会话列表
    $(".list-group").append('<a href="#" class="list-group-item">' + data.username + '</a>');

    //增加聊天窗口
    addChatBox(data);
  });
  //移除接入用户
  socket.on('remove served user', function(data) {
    $("#serveduserlist tr").each(function () {
      if (data.username == $(this).find('td').text()) {
        $(this).remove();
      }
    });
  });

  //维护在线用户列表
  socket.on('update userlist', function(data) {
    $("#userlist").empty();
    for (var i = data.length - 1; i >= 0; i--) {
      addUserToList(data[i]);
    }
    updateUserListCount();
  });

  socket.on('remove user', function(data) {
    removeListUser(data.name);
    updateUserListCount();
  });

  function addUserToList(data) {
    $("#userlist").append('<tr><td>' + data + '</td></tr>');
  }

  function removeListUser(data) {
    $("#userlist tr").each(function () {
      if (data == $(this).find('td').text()) {
        $(this).remove();
      }
    });
  }

  function updateUserListCount() {
    var list_count = $("#userlist").find('tr').length;
    $("#userlist-count").text("当前在线：" + list_count + "人");
  }

  //维护在线客服列表
  socket.on('update stafflist', function(data) {
    $("#stafflist").empty();
    for (var i = data.length - 1; i >= 0; i--) {
      addStaffToList(data[i]);
    }
    updateStaffListCount();
  });

  socket.on('remove staff', function(data) {
    removeListStaff(data.name);
    updateStaffListCount();
  });

  function addStaffToList(data) {
    $("#stafflist").append('<tr><td>' + data + '</td></tr>');
  }

  function removeListStaff(data) {
    $("#stafflist tr").each(function () {
      if (data == $(this).find('td').text()) {
        $(this).remove();
      }
    });
  }

  function updateStaffListCount() {
    var list_count = $("#stafflist").find('tr').length;
    $("#stafflist-count").text("当前在线：" + list_count + "人");
  }

  //维护正在服务列表
  socket.on('update servicelist', function(data) {
    $("#servicelist").empty();
    for (var i = data.length - 1; i >= 0; i--) {
      addServiceToList(data[i]);
    }
    updateServiceListCount();
  });

  socket.on('remove service', function(data) {
    removeListService(data.service);
    updateStaffListCount();
  });

  function addServiceToList(data) {
    $("#servicelist").append('<tr><td>' + data + '</td></tr>');
  }

  function removeListService(data) {
    $("#servicelist tr").each(function () {
      if (data == $(this).find('td').text()) {
        $(this).remove();
      }
    });
  }

  function updateServiceListCount() {
    var list_count = $("#servicelist").find('tr').length;
    $("#servicelist-count").text("正在服务：" + list_count);
  }

  function addChatBox(data) {
    var chatTemplateString = 'Hello World!';
    var html = ejs.render(templateString, {message: 'Hello World!'});
    // alert(html);
    // $(".col-md-10").append(html);
    $(".list-group").append('<a href="#" class="list-group-item">' + html + '</a>');
  }

});
