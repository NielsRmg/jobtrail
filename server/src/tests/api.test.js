require("dotenv").config();
const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const applicationRoutes = require("../routes/applicationRoutes");
const Application = require("../models/Application");
const errorHandler = require("../middlewares/errorHandler");

const app = express();
app.use(express.json());
app.use("/api/applications", applicationRoutes);
app.use(errorHandler);

beforeAll(async () => {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/jobtrail-test";
    await mongoose.connect(mongoUri);
});

afterEach(async () => {
    await Application.deleteMany({});
});

afterAll(async () => {
    await mongoose.connection.close();
});

describe("API Candidatures", () => {
    it("crée une candidature", async () => {
        const res = await request(app).post("/api/applications").send({
            company: "TestCorp",
            position: "Développeur",
            status: "applied",
        });

        expect(res.status).toBe(201);
        expect(res.body.company).toBe("TestCorp");
    });

    it("refuse une candidature sans entreprise", async () => {
        const res = await request(app).post("/api/applications").send({
            position: "Développeur",
        });

        expect(res.status).toBe(400);
    });

    it("recherche par préfixe du nom", async () => {
        await Application.create({company: "Airbus", position: "Dev", status: "applied"});
        await Application.create({company: "Safran", position: "Dev", status: "applied"});

        const res = await request(app).get("/api/applications?search=air");

        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].company).toBe("Airbus");
    });

    it("supprime une candidature", async () => {
        const created = await Application.create({
            company: "TestCorp",
            position: "Dev",
            status: "applied",
        });

        const res = await request(app).delete(`/api/applications/${created._id}`);
        expect(res.status).toBe(200);
    });
});