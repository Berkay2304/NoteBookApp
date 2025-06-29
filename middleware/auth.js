const jwt = require("jsonwebtoken");

function authenticate(req ,res, next){
    //token alma doğrulama
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ error: "Token has not found." });
    }
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
        if(err){
            return res.status(401).json({error:"Invalid Access"})
        }

        req.user = decoded;
        next();
    });
}

module.exports = authenticate;