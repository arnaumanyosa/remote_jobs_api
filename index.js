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

app.use(bodyParser.json({ limit: "1mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "1mb" }));

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

/**
 * Add a single job to our DB
 * @param {Object} request
 * @param {Object} response
 */
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
    "INSERT INTO jobs (source, sourceID, type, sourceUrl, creationDate, company, companyUrl, companyLogoUrl, title, description, tags, category, applyUrl) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) ON CONFLICT (sourceID) DO NOTHING",
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
    (queryError, queryResponse) => {
      if (queryError) {
        throw queryError;
      }
      console.info(
        `=> ${
          queryResponse.rowCount
        } jobs added out of 1 possible on ${new Date()
          .toJSON()
          .slice(0, 10)} at ${new Date().toJSON().slice(11, 19)}`
      );

      response.status(201).json({ status: "success", message: "Job added." });
    }
  );
};

/**
 * Add multiple jobs to our DB with a single INSERT
 * @param {Object} request
 * @param {Object} response
 */

const addJobs = (request, response) => {
  // We need to transponse the array of objects into a bidimensional array
  // In order to do a multiple row insert
  const dataTransposed = request.body.reduce(
    (acc, job) => {
      Object.keys(job).forEach((key, index) => acc[index].push(job[key]));
      return [...acc];
    },
    Object.keys(request.body[0]).map((item) => new Array())
  );

  // Define insert query using unnest
  const insertQuery = `INSERT INTO
  jobs (source, sourceID, type, sourceUrl, creationDate, company, companyUrl,
  companyLogoUrl, title, description, tags, category, applyUrl)
  SELECT * FROM UNNEST ($1::varchar[], $2::varchar[], $3::varchar[], $4::text[], $5::varchar[],
    $6::varchar[], $7::text[], $8::text[], $9::varchar[], $10::text[],$11::text[], $12::varchar[],$13::text[])
    ON CONFLICT (sourceID) DO NOTHING`;

  // Run insert query
  pool.query(insertQuery, dataTransposed, (queryError, queryResponse) => {
    if (queryError) {
      throw queryError;
    }

    console.info(
      `=> ${queryResponse.rowCount} jobs added out of ${
        request.body.length
      } possible on ${new Date()
        .toJSON()
        .slice(0, 10)} at ${new Date().toJSON().slice(11, 19)}`
    );

    response.status(201).json({
      status: "success",
      message: `${request.body.length} jobs added`,
    });
  });
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

app.route("/jobs").get(getJobs).post(addJobs).post(addJob);
app.route("/job").post(postLimiter, addJob);

// Start server
app.listen(process.env.PORT || 3002, () => {
  console.log(`Server listening...\n`);
});

// Export our app for testing purposes
module.exports = { app };
