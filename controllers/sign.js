


// show staff login page
exports.showLogin = function (req, res, next) {
  res.render('login');
};

// handle staff login
exports.login = function (req, res, next) {
  console.log(req.body.staffname);
  console.log(req.body.password);

  var staffname = req.body.staffname;
  var password = req.body.password;

  if (!staffname || !password) {
    res.status(422);
    return res.render('login', { error: '信息不完整。' });
  } else {
    req.session.staffname = staffname;
    req.session.password = password;
    res.redirect('/chat');
  }

};