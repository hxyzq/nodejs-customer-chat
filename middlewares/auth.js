



/**
 * 需要登录
 */
exports.staffRequired = function (req, res, next) {
  if (!req.session || !req.session.staffname || !req.session.staffid) {
    return res.redirect('/login');
  }
  next();
};