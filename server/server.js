require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./src/config/db");
const applicationRoutes = require("./src/routes/applicationRoutes");
const authRoutes = require("./src/routes/authRoutes");
const auth = require("./src/middlewares/auth");
const errorHandler = require("./src/middlewares/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
    cors({
        origin: ["http://localhost:5173", "https://jobtrail-n.onrender.com"],
    }),
);

app.use(express.json());

connectDB();

app.get("/api/health", (req, res) => {
    res.json({status: "OK", message: "JobTrail API is running"});
});

app.use("/api/auth", authRoutes);
app.use("/api/applications", auth, applicationRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Serveur démarré sur le port ${PORT}`);
});