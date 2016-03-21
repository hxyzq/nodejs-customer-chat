var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('chat');
});

router.get('/chat', function(req, res, next) {
  res.render('chat');
});

router.get('/wait', function(req, res, next) {
  res.render('wait');
});

router.get('/history', function(req, res, next) {
  res.render('history');
});

router.get('/profile', function(req, res, next) {
  res.render('profile');
});



router.get('/staff', function (req, res, next) {
  res.render('staff');
});

router.get('/index', function (req, res, next) {
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