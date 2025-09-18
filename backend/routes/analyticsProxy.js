const express = require('express');
const axios = require('axios');

// Proxy analytics requests to Hugging Face Space
// Requires env HF_ANALYTICS_BASE_URL, e.g., https://suscp-smartcityos.hf.space

const router = express.Router();

const baseURL = process.env.HF_ANALYTICS_BASE_URL;
if (!baseURL) {
  console.warn('[analyticsProxy] HF_ANALYTICS_BASE_URL not set; proxy routes will 503');
}

const client = axios.create({
  baseURL: baseURL || 'http://invalid-analytics-base',
  timeout: 15000,
});

// Forward GET requests
router.get('*', async (req, res) => {
  if (!baseURL) return res.status(503).json({ ok: false, error: 'Analytics proxy not configured' });
  try {
    const url = req.originalUrl.replace(/^\/api\/analytics/, '') || '/';
    const response = await client.get(url, { params: req.query, headers: { 'x-forwarded-by': 'smart-city-os-backend' } });
    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({ ok: false, error: 'Upstream analytics error', detail: err.response?.data || err.message });
  }
});

// Forward POST requests
router.post('*', async (req, res) => {
  if (!baseURL) return res.status(503).json({ ok: false, error: 'Analytics proxy not configured' });
  try {
    const url = req.originalUrl.replace(/^\/api\/analytics/, '') || '/';
    const response = await client.post(url, req.body, { headers: { 'x-forwarded-by': 'smart-city-os-backend' } });
    res.status(response.status).set(response.headers).send(response.data);
  } catch (err) {
    const status = err.response?.status || 502;
    res.status(status).json({ ok: false, error: 'Upstream analytics error', detail: err.response?.data || err.message });
  }
});

module.exports = router;

