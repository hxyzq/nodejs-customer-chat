var express = require('express');
var router = express.Router();

var sign = require('../controllers/sign');
var staff = require('../controllers/staff');
var user = require('../controllers/user');

var auth = require('../middlewares/auth');

router.get('/login', sign.showLogin);  // 进入登录页面.
router.post('/login', sign.login);  // 登录校验
router.get('/logout', sign.logout); // 登出

router.get('/', auth.staffRequired, staff.showChat); // 首页
router.get('/chat', auth.staffRequired, staff.showChat); // 客服聊天页面
router.get('/wait', auth.staffRequired, staff.showWait); // 客服待接入页面
router.get('/history', auth.staffRequired, staff.showHistory); // 客服历史聊天页面
router.get('/profile', auth.staffRequired, staff.showProfile); // 客服个人信息页面
router.post('/profile', auth.staffRequired, staff.setProfile); // 提交个人信息

router.post('/history/showChatHistory', staff.showChatHistory); //显示聊天记录
router.post('/history/deleteChatHistory', staff.deleteChatHistory); // 删除聊天记录
router.get('/history/download', staff.downloadChatHistroy); //下载聊天记录

router.post('/history/loadPage', staff.showHistoryList);


router.get('/index', auth.staffRequired, function (req, res, next) {
  res.render('index2');
});


router.get('/user', user.showChat); // 用户聊天页面
router.get('/userHistory', user.showHistory); // 用户聊天记录

router.get('/user2', function (req, res, next) {
    res.render('user2');
});

router.get('/test', function (req, res, next) {
    res.render('test');
});

module.exports = router;