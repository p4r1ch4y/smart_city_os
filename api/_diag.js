module.exports = async (req, res) => {
  try {
    // Try to import the Express app to diagnose crashes in serverless
    const app = require('../backend/server-no-db');
    // Return a basic response if import succeeded
    res.status(200).json({ ok: true, message: 'Express app imported successfully' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message, stack: e.stack });
  }
};

