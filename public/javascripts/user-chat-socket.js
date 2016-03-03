$(function() {
  var socket = io();
  // var socket = io().connect('http://localhost:3000/', {
  //   'reconnect': true,
  //   'auto connect': true,
  //   'force new connection': true
  // });

  var userid = Math.random()*900000|0100000; //生成6位随机数
  var username = '用户' + userid;

  log('正在连接服务器...');
  socket.on('connect', function() {

      //用户登陆请求，传递用户名和id
      socket.emit('user login', {
        id: userid,
        name: username,
      });

  });

  socket.on('log', function(msg) {
    log(msg);
  });


  //各类方法
  function log(message) {
    addMessageElement($('<li>').addClass('log').text(message));
  }
  function addMessageElement(el) {
    $('#messages').append($(el).hide().fadeIn(200));
    $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
  }

});