// api/orders.js — Vercel Serverless Function
// POST /api/orders — Secure checkout with server-side price recalculation
import { getDb } from '../lib/db.js';
import { ObjectId } from 'mongodb';

// ─── Sanitization Helpers ───────────────────────────────────────────────────
function sanitizeString(val, maxLen = 200) {
  if (typeof val !== 'string') return '';
  return val.replace(/[${}]/g, '').trim().slice(0, maxLen);
}

function sanitizeEmail(val) {
  if (typeof val !== 'string') return '';
  const cleaned = val.replace(/[${}]/g, '').trim().toLowerCase().slice(0, 254);
  // Basic RFC 5321 pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : '';
}

function validateCustomer(customer) {
  const errors = [];
  if (!sanitizeString(customer?.firstName)) errors.push('First name is required');
  if (!sanitizeString(customer?.lastName)) errors.push('Last name is required');
  if (!sanitizeEmail(customer?.email)) errors.push('Valid email is required');
  if (!sanitizeString(customer?.address)) errors.push('Street address is required');
  if (!sanitizeString(customer?.city)) errors.push('City is required');
  if (!sanitizeString(customer?.zip)) errors.push('ZIP code is required');
  return errors;
}

// ─── CORS Headers ────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

export default async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── Rate limiting hint (use Vercel Edge Middleware in production) ────────
  const ip = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'unknown';

  try {
    const db = await getDb();
    const { customer, items } = req.body;

    // ─── 1. Validate customer fields ────────────────────────────────────────
    const customerErrors = validateCustomer(customer);
    if (customerErrors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: customerErrors });
    }

    // ─── 2. Validate items array ─────────────────────────────────────────────
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart cannot be empty' });
    }
    if (items.length > 50) {
      return res.status(400).json({ error: 'Too many items in cart' });
    }

    // ─── 3. Server-side price recalculation (SECURITY CRITICAL) ─────────────
    // Never trust prices from the frontend — fetch authoritative prices from DB
    const productIds = items
      .map(item => {
        try { return new ObjectId(item.productId); }
        catch { return null; }
      })
      .filter(Boolean);

    const dbProducts = await db.collection('products')
      .find({ _id: { $in: productIds } })
      .toArray();

    const productMap = new Map(dbProducts.map(p => [p._id.toString(), p]));

    // Build verified line items
    let serverTotal = 0;
    const verifiedItems = [];

    for (const item of items) {
      const qty = Math.max(1, Math.min(parseInt(item.quantity) || 1, 99));
      const dbProduct = productMap.get(item.productId?.toString());

      if (!dbProduct) {
        return res.status(400).json({
          error: `Product not found: ${sanitizeString(String(item.productId))}`,
        });
      }

      const lineTotal = dbProduct.price * qty;
      serverTotal += lineTotal;

      verifiedItems.push({
        productId: dbProduct._id,
        name: dbProduct.name,
        category: dbProduct.category,
        unitPrice: dbProduct.price,
        quantity: qty,
        lineTotal,
      });
    }

    // ─── 4. Build & persist the order ────────────────────────────────────────
    const order = {
      customer: {
        firstName: sanitizeString(customer.firstName, 50),
        lastName: sanitizeString(customer.lastName, 50),
        email: sanitizeEmail(customer.email),
        phone: sanitizeString(customer.phone || '', 30),
        address: sanitizeString(customer.address, 200),
        city: sanitizeString(customer.city, 100),
        state: sanitizeString(customer.state || '', 100),
        zip: sanitizeString(customer.zip, 20),
        country: sanitizeString(customer.country || 'United States', 100),
      },
      items: verifiedItems,
      pricing: {
        subtotal: serverTotal,
        tax: parseFloat((serverTotal * 0.08).toFixed(2)),          // 8% tax
        shipping: serverTotal > 100 ? 0 : 9.99,                    // Free ship over $100
        total: parseFloat(
          (serverTotal + serverTotal * 0.08 + (serverTotal > 100 ? 0 : 9.99)).toFixed(2)
        ),
      },
      notes: sanitizeString(customer.notes || '', 500),
      status: 'pending',
      ip: ip.split(',')[0].trim().slice(0, 45), // Store first IP only
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(order);

    // ─── 5. Success response ─────────────────────────────────────────────────
    return res.status(201).json({
      success: true,
      orderId: result.insertedId,
      total: order.pricing.total,
      message: 'Order placed successfully',
    });

  } catch (err) {
    console.error('[POST /api/orders] Error:', err);
    return res.status(500).json({ error: 'Failed to place order. Please try again.' });
  }
}