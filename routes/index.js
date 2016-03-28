var express = require('express');
var router = express.Router();

var sign = require('../controllers/sign');
var staff = require('../controllers/staff');

var auth = require('../middlewares/auth');

router.get('/login', sign.showLogin);  // 进入登录页面.
router.post('/login', sign.login);  // 登录校验
router.get('/logout', sign.logout) //登出

router.get('/', auth.staffRequired, staff.showChat); //首页
router.get('/chat', auth.staffRequired, staff.showChat); //客服聊天页面
router.get('/wait', auth.staffRequired, staff.showWait); //客服待接入页面
router.get('/history', auth.staffRequired, staff.showHistory); //客服历史聊天页面
router.get('/profile', auth.staffRequired, staff.showProfile); //客服个人信息页面

router.get('/index', auth.staffRequired, function (req, res, next) {
  res.render('index2');
});

//用户聊天页面
router.get('/user', function (req, res, next) {
    res.render('user');
});

router.get('/user2', function (req, res, next) {
    res.render('user2');
});

router.get('/test', function (req, res, next) {
    res.render('test');
});

module.exports = router;