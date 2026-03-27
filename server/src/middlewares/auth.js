const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
    const header = req.headers.authorization;

    if (!header || !header.startsWith("Bearer ")) {
        return res.status(401).json({message: "Token manquant"});
    }

    try {
        const token = header.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({message: "Token invalide"});
    }
};

module.exports = auth;