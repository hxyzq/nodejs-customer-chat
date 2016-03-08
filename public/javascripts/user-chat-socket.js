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

  //收到服务器发来的 log
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


  //各类方法
  function sendMessage() {
    var message = $("#inputMessage").val();

    message = cleanInput(message);

    if (!message) { //如果过滤后的内容为空
      return;
    }

    socket.emit('user message', {
      userid: userid,
      username: username,
      message: message
    });

    // 有输入内容, 且已经连接成功, 且当前有客服和他匹配
    // if (connected && linked) {
    //   $inputMessage.val('');

    //   addChatMessage({
    //     color: '#008040',
    //     username: username,
    //     message: message
    //   });

    //   socket.emit('new message', {
    //     id: userid,
    //     message: message
    //   });
    // } else {
    //   log(connected ? ( //连接成功, 但还没有 匹配成功
    //     isKF ? '还没有访客接入, 不能发送消息 ...' : '客服忙, 请稍等 ...'
    //   ) : '正在连接服务器...'); //未连接成功时的提示文字
    // }
  }
  function cleanInput(text) {
    return $('<div/>').text(text).text();
  }
  function log(message) {
    addMessageElement($('<li>').addClass('log').text(message));
  }
  function addMessageElement(el) {
    $('#messages').append($(el).hide().fadeIn(200));
    $('#messages')[0].scrollTop = $('#messages')[0].scrollHeight;
  }

});