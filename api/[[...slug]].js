// Catch-all Vercel Serverless Function for all /api/* routes
// Delegates handling to the Express app defined in backend/server-no-db.js

const app = require('../backend/server-no-db');

module.exports = (req, res) => {
  return app(req, res);
};

