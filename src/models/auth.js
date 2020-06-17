const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error_msg", "please signin to view this resource");
  res.redirect("/users/emailsignin");
};

const LoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) return next();
  req.flash("error_msg", "already logged in");
  res.redirect("/");
};

module.exports = {
  ensureAuthenticated: ensureAuthenticated,
  LoggedIn: LoggedIn,
};
