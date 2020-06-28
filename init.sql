CREATE TABLE jobs (
  ID SERIAL PRIMARY KEY,
  source VARCHAR(64) NOT NULL,
  sourceID VARCHAR(64) NOT NULL,
  type VARCHAR(32) NOT NULL,
  sourceUrl TEXT NOT NULL,
  creationDate VARCHAR(64) NOT NULL,
  company VARCHAR(255) NOT NULL,
  companyUrl TEXT NOT NULL,
  companyLogoUrl TEXT,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  tags VARCHAR(32)[],
  category VARCHAR(32),
  applyUrl TEXT NOT NULL
);

INSERT INTO jobs (source, sourceID, type, sourceUrl, creationDate, company, companyUrl, title, description, applyUrl)
VALUES  ('me', '00000', 'Full time', 'http', '20-20-2020', 'mememe', 'http', 'senior job role', 'a description...', 'http');