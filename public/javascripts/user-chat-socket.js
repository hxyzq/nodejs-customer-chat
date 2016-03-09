$(function() {
  var socket = io();
  // var socket = io().connect('http://localhost:3000/', {
  //   'reconnect': true,
  //   'auto connect': true,
  //   'force new connection': true
  // });

  var userid = Math.random()*900000|0+100000; //生成6位随机数
  var username = '用户' + userid;

  log('正在连接服务器...');
  socket.on('connect', function() {

      //用户登陆请求，传递用户名和id
      socket.emit('user login', {
        userid: userid,
        username: username,
      });

  });

  //收到服务器发来的log
  socket.on('log', function(msg) {
    log(msg);
  });

  //inputMessage检测回车发送消息
  $('#inputMessage').keydown(function(_event) {
   if(13 == _event.keyCode) {
      sendMessage();
      return false;
    }
  });
  socket.on('new message', function(data) {
    addChatMessage({
      username: data.staffname,
      message: data.message
    });
  });

  //各类方法
  function sendMessage() {
    var message = $("#inputMessage").val();

    if (!message) { //如果内容为空
      return;
    }
    $("#inputMessage").val('');

    addChatMessage({
      color: '#008040',
      username: username,
      message: message
    });

    socket.emit('user message', {
      userid: userid,
      username: username,
      message: message
    });

  }
  // Log a message
  function log(message) {
    addMessageElement($('<li>').addClass('log').text(message));
  }
  // Adds the visual chat message to the message list
  function addChatMessage (data) {
    var $usernameDiv = $('<span class="username"/>').text(data.username).css('color', data.color || '#00f');
    var $messageBodyDiv = $('<span class="messageBody">').text(data.message);
    var $messageDiv = $('<li class="message"/>')
      .data('username', data.username)
      .append($usernameDiv, formatDate(new Date()) + '<br/>', $messageBodyDiv);

    addMessageElement($messageDiv);
  }
  //时间格式化
  function formatDate(t){
    var M = t.getMonth() + 1,
      D = t.getDate(),
      H = t.getHours(),
      m = t.getMinutes(),
      s = t.getSeconds();

    return [M, '-', D, ' ', H, ':', m, ':', s].join('');
  }
  function addMessageElement(el) {
    $('#messages').append($(el).hide().fadeIn(200));
    $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
  }

});