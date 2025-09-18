const { createClient } = require('@supabase/supabase-js');

function cors(res) {
  const origin = process.env.CORS_ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

function getClient(allowAnon = true) {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.SUPABASE_ANON_KEY;
  if (!url) return null;
  const key = allowAnon ? (anonKey || serviceKey) : (serviceKey || anonKey);
  if (!key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
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

  const client = getClient(true);
  if (!client) {
    return res.status(503).json({ ok: false, error: 'SUPABASE_URL or key missing' });
  }

  // Vercel dynamic routes: id is in query
  const id = (req.query && (req.query.id || req.query["id"])) || (req.url.split('/').pop());
  if (!id) return res.status(400).json({ ok: false, error: 'id is required' });

  try {
    if (req.method === 'GET') {
      const { data, error } = await client
        .from('announcements')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return res.status(200).json({ ok: true, data: mapRow(data) });
    }

    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
};

