// api/products.js — Vercel Serverless Function
// GET /api/products?category=Hardware&search=keyboard
import { getDb } from '../lib/db.js';

// ─── Input Sanitization (NoSQL Injection Prevention) ───────────────────────
function sanitizeString(value) {
  if (typeof value !== 'string') return undefined;
  // Strip MongoDB operator characters to prevent injection
  return value.replace(/[${}]/g, '').trim().slice(0, 100);
}

export default async function handler(req, res) {
  // ─── CORS Headers ───────────────────────────────────────────────────────
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const db = await getDb();

    // ─── Query Building ─────────────────────────────────────────────────
    const query = {};

    // Category filter — exact match, sanitized
    const rawCategory = req.query.category;
    if (rawCategory) {
      const category = sanitizeString(rawCategory);
      if (category) query.category = category;
    }

    // Search — case-insensitive regex on name & description, sanitized
    const rawSearch = req.query.search;
    if (rawSearch) {
      const search = sanitizeString(rawSearch);
      if (search) {
        // Escape regex special chars to prevent ReDoS
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        query.$or = [
          { name: { $regex: escaped, $options: 'i' } },
          { description: { $regex: escaped, $options: 'i' } },
          { category: { $regex: escaped, $options: 'i' } },
        ];
      }
    }

    // ─── Pagination ─────────────────────────────────────────────────────
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);
    const skip = Math.max(parseInt(req.query.skip) || 0, 0);

    // ─── Fetch ──────────────────────────────────────────────────────────
    const [products, total] = await Promise.all([
      db.collection('products')
        .find(query)
        .sort({ featured: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection('products').countDocuments(query),
    ]);

    // ─── Response ───────────────────────────────────────────────────────
    return res.status(200).json({
      products,
      meta: {
        total,
        returned: products.length,
        skip,
        limit,
      },
    });

  } catch (err) {
    console.error('[GET /api/products] Error:', err);
    return res.status(500).json({ error: 'Failed to fetch products. Please try again.' });
  }
}