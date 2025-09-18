const axios = require('axios');

module.exports = async (req, res) => {
  try {
    const baseURL = process.env.HF_ANALYTICS_BASE_URL;
    if (!baseURL) {
      return res.status(503).json({ ok: false, error: 'HF_ANALYTICS_BASE_URL is not configured' });
    }

    // Extract the suffix after /api/analytics
    const url = req.url || '';
    const suffix = url.replace(/^\/api\/analytics/, '') || '/';
    const targetUrl = baseURL.replace(/\/$/, '') + suffix;

    const method = (req.method || 'GET').toUpperCase();
    const headers = { ...req.headers };
    // Remove hop-by-hop headers that should not be forwarded
    delete headers['host'];
    delete headers['content-length'];

    const axiosConfig = {
      url: targetUrl,
      method,
      headers,
      params: req.query,
      validateStatus: () => true,
      timeout: 15000,
      data: ['POST', 'PUT', 'PATCH'].includes(method) ? req.body : undefined,
    };

    const resp = await axios(axiosConfig);
    res.status(resp.status).send(resp.data);
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
};

