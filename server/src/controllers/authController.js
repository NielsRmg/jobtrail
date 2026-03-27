const argon2 = require("argon2");
const jwt = require("jsonwebtoken");

exports.login = async (req, res, next) => {
    try {
        const {password} = req.body;
        console.log("Password reçu:", password);
        console.log("Hash en env:", process.env.PASSWORD_HASH?.substring(0, 30) + "...");

        if (!password) {
            return res.status(400).json({message: "Mot de passe requis"});
        }

        const valid = await argon2.verify(process.env.PASSWORD_HASH, password);
        console.log("Vérification:", valid);

        if (!valid) {
            return res.status(401).json({message: "Mot de passe incorrect"});
        }

        const token = jwt.sign({user: "admin"}, process.env.JWT_SECRET, {
            expiresIn: "30d",
        });

        res.json({token});
    } catch (error) {
        console.error("Erreur auth:", error);
        next(error);
    }
};