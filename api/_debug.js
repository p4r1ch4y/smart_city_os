module.exports = (req, res) => {
  const pick = (k) => process.env[k];
  res.json({
    ok: true,
    runtime: {
      VERCEL: pick('VERCEL') ? '1' : '0',
      NOW_REGION: pick('NOW_REGION') || null,
      NODE_ENV: pick('NODE_ENV') || null,
    },
    config: {
      BACKEND_ONLY: pick('BACKEND_ONLY') || null,
      CORS_ALLOWED_ORIGIN: pick('CORS_ALLOWED_ORIGIN') || null,
    },
  });
};

