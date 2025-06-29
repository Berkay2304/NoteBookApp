function authorize(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Yetkisiz, önce giriş yapınız." });
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ error: "Bu işlemi yapmak için yetkiniz yok." });
    }

    next();
  };
}

module.exports = authorize;