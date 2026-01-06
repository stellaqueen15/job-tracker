require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const jobsRoutes = require("./routes/jobs.routes");

app.use(cors());
app.use(express.json());

app.use("/api/jobs", jobsRoutes);

module.exports = app;
