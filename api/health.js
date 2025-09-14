module.exports = (req, res) => {
  res.status(200).json({ ok: true, service: 'backend', path: '/api/health', ts: new Date().toISOString() });
};

