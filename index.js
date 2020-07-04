const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const { pool } = require("./config");

const app = express();

app.use(compression());
app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cors());

const getJobs = (request, response) => {
  pool.query("SELECT * FROM jobs", (error, results) => {
    if (error) {
      console.log("get jobs error => ", error);

      throw error;
    }
    response.status(200).json(results.rows);
  });
};

const addJob = (request, response) => {
  const {
    source,
    sourceID,
    type,
    sourceUrl,
    creationDate,
    company,
    companyUrl,
    companyLogoUrl,
    title,
    description,
    tags,
    category,
    applyUrl,
  } = request.body;

  pool.query(
    "INSERT INTO jobs (source, sourceID, type, sourceUrl, creationDate, company, companyUrl, companyLogoUrl, title, description, tags, category, applyUrl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)",
    [
      source,
      sourceID,
      type,
      sourceUrl,
      creationDate,
      company,
      companyUrl,
      companyLogoUrl,
      title,
      description,
      tags,
      category,
      applyUrl,
    ],
    (error) => {
      if (error) {
        throw error;
      }
      response.status(201).json({ status: "success", message: "Job added." });
    }
  );
};

const mainLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // 5 requests,
});

app.use(mainLimiter);

const postLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 1,
});

app.route("/jobs").get(getJobs).post(postLimiter, addJob);

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening...`);
});

// Export our app for testing purposes
module.exports = { app };
