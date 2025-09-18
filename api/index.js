// Vercel Serverless Function entrypoint for Smart City OS backend (no-DB)
// This wraps the Express app exported by backend/server-no-db.js

const app = require('../backend/server-no-db');

module.exports = (req, res) => {
  // Ensure CORS origin is respected via env
  // The app itself already sets cors/helmet; we just delegate the request
  return app(req, res);
};

