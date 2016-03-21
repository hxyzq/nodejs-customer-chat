$(function() {

  var socket = io();
  // // var socket = io().connect('http://localhost:3000/', {
  // //   'reconnect': true,
  // //   'auto connect': true,
  // //   'force new connection': true
  // // });

  var staffid = getParam('staffid');
  var userid = getParam('userid');

  log('正在连接服务器...');
  socket.on('connect', function() {

      //客服聊天请求，传递staffid和userid
      socket.emit('chat server', {
        staffid: staffid,
        userid: userid,
      });

  });

  //收到服务器发来的log
  socket.on('log', function(msg) {
    log(msg);
    //收到服务器的开始服务log后向用户发送问候语
    if (msg.indexOf('开始服务') > -1) {
      addChatMessage({
        color: '#008040',
        username: '客服' + staffid,
        message: '您好,请问有什么可以帮助您的？'
      });
      socket.emit('staff message', {
        staffid: staffid,
        staffname: '客服' + staffid,
        userid: userid,
        message: '您好,请问有什么可以帮助您的？'
      });
    }
  });

  //inputMessage检测回车发送消息
  $('#inputMessage').keydown(function(event) {
    if(13 == event.keyCode) {
      sendMessage();
      return false;
    }
  });

  socket.on('new message', function(data) {
    addChatMessage({
      username: data.username,
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
      username: '客服' + staffid,
      message: message
    });

    socket.emit('staff message', {
      staffid: staffid,
      staffname: '客服' + staffid,
      userid: userid,
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
  function formatDate(t) {
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

  /*
   * 获取指定的URL参数值
   * URL:http://www.quwan.com/index?name=tyler
   * 参数：paramName URL参数
   * 调用方法:getParam("name")
   * 返回值:tyler
   */
   function getParam(paramName) {
    paramValue = "", isFound = !1;
    if (this.location.search.indexOf("?") == 0 && this.location.search.indexOf("=") > 1) {
      arrSource = unescape(this.location.search).substring(1, this.location.search.length).split("&"), i = 0;
      while (i < arrSource.length && !isFound) arrSource[i].indexOf("=") > 0 && arrSource[i].split("=")[0].toLowerCase() == paramName.toLowerCase() && (paramValue = arrSource[i].split("=")[1], isFound = !0), i++
    }
    return paramValue == "" && (paramValue = null), paramValue
  }

});
