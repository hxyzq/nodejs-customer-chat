var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/user', function (req, res) {
    res.render('user');
});

router.get('/staff', function (req, res) {
    res.render('staff');
});

module.exports = router;