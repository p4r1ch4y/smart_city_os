const { createClient } = require('@supabase/supabase-js');

function cors(res) {
  const origin = process.env.CORS_ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getClient(preferService = true, authBearer = null) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url) return null;
  const key = preferService ? (serviceKey || anonKey) : (anonKey || serviceKey);
  if (!key) return null;
  const options = { auth: { persistSession: false } };
  if (authBearer && (!serviceKey || !preferService)) {
    options.global = { headers: { Authorization: `Bearer ${authBearer}` } };
  }
  return createClient(url, key, options);
}

function mapRow(r) {
  return {
    id: r.id,
    title: r.title,
    content: r.content,
    imageUrl: r.image_url || '',
    videoUrl: r.video_url || '',
    linkUrl: r.link_url || '',
    author: r.author || 'admin',
    createdAt: r.created_at,
  };
}

module.exports = async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const client = getClient(false); // allow anon for public read
      if (!client) return res.status(503).json({ ok: false, error: 'SUPABASE_URL/KEY missing' });
      const { data, error } = await client
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ ok: true, data: (data || []).map(mapRow) });
    }

    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const { title, content, imageUrl = '', videoUrl = '', linkUrl = '', author = 'admin' } = body;
      if (!title || !content) {
        return res.status(400).json({ ok: false, error: 'title and content are required' });
      }

      // If service role is available, use it; otherwise, try RLS with user token
      const authHeader = req.headers['authorization'] || req.headers['Authorization'];
      const bearer = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

      let client;
      if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
        client = getClient(true);
      } else if (bearer) {
        client = getClient(false, bearer); // use anon key with user JWT to satisfy RLS
      } else {
        return res.status(503).json({ ok: false, error: 'No service role key configured and missing Authorization Bearer token' });
      }

      const insertPayload = { title, content, image_url: imageUrl, video_url: videoUrl, link_url: linkUrl, author };

      const { data, error } = await client
        .from('announcements')
        .insert(insertPayload)
        .select('*')
        .single();
      if (error) throw error;
      return res.status(201).json({ ok: true, data: mapRow(data) });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

