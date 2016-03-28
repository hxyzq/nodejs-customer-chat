


// show staff chat page
exports.showChat = function(req, res, next) {
  res.render('chat', {
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff wait page
exports.showWait = function(req, res, next) {
  res.render('wait', {
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff history page
exports.showHistory = function(req, res, next) {
  res.render('history', {
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}

// show staff profile page
exports.showProfile = function(req, res, next) {
  res.render('profile', {
    staffid: req.session.staffid,
    staffname: req.session.staffname
  });
}