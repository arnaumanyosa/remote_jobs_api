// Import the dependencies for testing
const chai = require("chai");
const chaiHttp = require("chai-http");
const { app } = require("../index");

// Configure chai
chai.use(chaiHttp);
chai.should();

describe("Jobs", () => {
  describe("GET /jobs", () => {
    // Test to get all jobs record
    it("should get all jobs record", (done) => {
      chai
        .request(app)
        .get("/jobs")
        .end((err, res) => {
          res.should.have.status(200);
          res.body.should.be.a("array");
          done();
        });
    });

    // Test get limiter
    it("Sixth GET call in less than a minute should get a http response status of 429 (Too many requests)", (done) => {
      const requester = chai.request(app).keepOpen();

      let startTest = Date.now();

      Promise.all([0, 1, 2, 3, 4, 5].map((call) => requester.get("/jobs")))
        .then((responses) => {
          let endTestdiffMs = Math.abs(Date.now() - startTest);
          endTestdiffMs.should.be.lte(1 * 60 * 1000);
          responses[5].should.have.status(429);
          done();
        })
        .then(() => requester.close());
    });
  });
});
