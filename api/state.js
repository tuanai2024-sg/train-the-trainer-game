import { kv } from '@vercel/kv';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    if (req.method === 'GET') {
      const raw = await kv.hgetall('results');
      return res.json(raw || {});
    }

    if (req.method === 'POST') {
      const { name, animalId, q1, q2, q3 } = req.body;
      if (!name) return res.status(400).json({ error: 'name required' });
      await kv.hset('results', {
        [name]: { name, animalId, q1: q1 || '', q2: q2 || '', q3: q3 || '', ts: Date.now() }
      });
      return res.json({ ok: true });
    }

    if (req.method === 'DELETE') {
      await kv.del('results');
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    console.error('KV error:', e);
    // Fallback: return empty state if KV not configured yet
    if (req.method === 'GET') return res.json({});
    return res.status(500).json({ error: e.message });
  }
}
