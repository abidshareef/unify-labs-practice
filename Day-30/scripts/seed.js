// scripts/seed.js — Run once to populate MongoDB with demo products
// Usage: node scripts/seed.js
import { MongoClient } from 'mongodb';
import 'dotenv/config';

const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = process.env.DB_NAME || 'titan_marketplace';

const PRODUCTS = [
  // ── HARDWARE ──────────────────────────────────────────────────────────────
  {
    name: 'Apex Pro Mechanical Keyboard',
    category: 'Hardware',
    price: 189.99,
    description: 'Cherry MX Red switches, aircraft-grade aluminum frame, per-key RGB lighting. Rated for 100M keystrokes. The last keyboard you will ever need.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=85',
    badge: 'Bestseller',
    stock: 48,
    featured: true,
    createdAt: new Date(),
  },
  {
    name: 'Phantom 27" 4K Monitor',
    category: 'Hardware',
    price: 649.00,
    description: 'IPS Nano panel, 144Hz refresh, HDR600, factory-calibrated with ΔE<2. Built for developers and creative professionals who live in their screens.',
    image: 'https://images.unsplash.com/photo-1593640408182-31c228f30b66?w=600&q=85',
    badge: null,
    stock: 22,
    featured: true,
    createdAt: new Date(),
  },
  {
    name: 'Stealth Wireless Mouse',
    category: 'Hardware',
    price: 79.99,
    description: 'Ultra-precise 25,600 DPI optical sensor, 70-hour battery, silent click switches. Zero-lag 2.4GHz wireless with USB-C charging.',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=85',
    badge: 'New',
    stock: 95,
    featured: false,
    createdAt: new Date(),
  },
  {
    name: 'Titan USB-C Hub Pro (11-in-1)',
    category: 'Hardware',
    price: 89.99,
    description: 'Thunderbolt 4 passthrough, dual 4K HDMI, SD/MicroSD, 3x USB-A 3.2, Ethernet, 3.5mm audio. The only hub your desk needs.',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=85',
    badge: null,
    stock: 60,
    featured: false,
    createdAt: new Date(),
  },

  // ── SOFTWARE ──────────────────────────────────────────────────────────────
  {
    name: 'DevSuite Pro — Annual License',
    category: 'Software',
    price: 129.00,
    description: 'Full IDE suite with AI-powered completion, built-in Git, cloud sync, and 50+ language support. Trusted by 200,000+ developers worldwide.',
    image: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&q=85',
    badge: null,
    stock: 9999,
    featured: true,
    createdAt: new Date(),
  },
  {
    name: 'VaultShield VPN — Annual Plan',
    category: 'Software',
    price: 49.99,
    description: 'AES-256 encryption, 5,400+ global servers across 60 countries, strict zero-log policy. Protects up to 6 devices simultaneously.',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=85',
    badge: 'Popular',
    stock: 9999,
    featured: false,
    createdAt: new Date(),
  },
  {
    name: 'DesignFlow Creative Suite',
    category: 'Software',
    price: 99.00,
    description: 'Vector illustration, raster editing, UI/UX prototyping, and motion design — all in one app. Export to any format, any platform.',
    image: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=85',
    badge: null,
    stock: 9999,
    featured: false,
    createdAt: new Date(),
  },

  // ── AUDIO ─────────────────────────────────────────────────────────────────
  {
    name: 'Titan ANC Headphones XR',
    category: 'Audio',
    price: 299.00,
    description: '40dB active noise cancellation, 35-hour playtime, spatial audio, custom 40mm titanium drivers. Folds flat, built to outlast everything.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=85',
    badge: 'Bestseller',
    stock: 34,
    featured: true,
    createdAt: new Date(),
  },
  {
    name: 'Studio Monitor Speakers (Pair)',
    category: 'Audio',
    price: 249.99,
    description: '5" woofer + 1" tweeter, bi-amplified, flat frequency response 50Hz–20kHz. Perfect reference monitoring for producers and podcasters.',
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=600&q=85',
    badge: null,
    stock: 15,
    featured: false,
    createdAt: new Date(),
  },

  // ── ACCESSORIES ───────────────────────────────────────────────────────────
  {
    name: 'Magnetic Laptop Stand Pro',
    category: 'Accessories',
    price: 69.99,
    description: 'Adjustable 0–90° tilt, supports up to 22 lbs, hidden cable management, aerospace aluminum. Elevate your workspace, literally.',
    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=85',
    badge: null,
    stock: 72,
    featured: false,
    createdAt: new Date(),
  },
  {
    name: 'Precision Desk Mat XL',
    category: 'Accessories',
    price: 44.99,
    description: '900×400mm stitched-edge desk pad, non-slip rubber base, micro-textured surface optimized for both mouse and wrist comfort.',
    image: 'https://images.unsplash.com/photo-1616627988099-3af5d5b62a7d?w=600&q=85',
    badge: 'New',
    stock: 120,
    featured: false,
    createdAt: new Date(),
  },

  // ── NETWORKING ────────────────────────────────────────────────────────────
  {
    name: 'Nexus WiFi 6E Router',
    category: 'Networking',
    price: 349.00,
    description: 'Tri-band AXE7800, 5GHz 6GHz dedicated backhaul, WPA3 security, covers 3,000 sq ft. Handles 200+ simultaneous connections effortlessly.',
    image: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=600&q=85',
    badge: 'Popular',
    stock: 28,
    featured: true,
    createdAt: new Date(),
  },

  // ── STORAGE ───────────────────────────────────────────────────────────────
  {
    name: 'Titan NVMe SSD 2TB',
    category: 'Storage',
    price: 179.99,
    description: 'PCIe Gen 4 x4, 7,400MB/s sequential read, 6,900MB/s write. Includes thermal shield. 5-year warranty with Titan Data Protection.',
    image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=85',
    badge: null,
    stock: 55,
    featured: false,
    createdAt: new Date(),
  },
  {
    name: 'Rugged Portable SSD 1TB',
    category: 'Storage',
    price: 119.99,
    description: '2,000MB/s transfer speeds, IP65 water & dust resistant, 3m drop protection. Works with USB-C, USB-A, and Thunderbolt 3/4.',
    image: 'https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=600&q=85',
    badge: 'New',
    stock: 42,
    featured: false,
    createdAt: new Date(),
  },

  // ── APPAREL ───────────────────────────────────────────────────────────────
  {
    name: 'TITAN Founder Hoodie',
    category: 'Apparel',
    price: 89.00,
    description: '400gsm French Terry, oversized fit, embroidered logo, pre-shrunk cotton-poly blend. Limited first-run batch — built for builders.',
    image: 'https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600&q=85',
    badge: 'Limited',
    stock: 30,
    featured: false,
    createdAt: new Date(),
  },
];

async function seed() {
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI is not defined. Create a .env file first.');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await client.connect();
    const db = client.db(DB_NAME);

    // ── Clear existing products ──────────────────────────────────────────────
    const existing = await db.collection('products').countDocuments();
    if (existing > 0) {
      console.log(`⚠️  Found ${existing} existing products. Clearing collection...`);
      await db.collection('products').deleteMany({});
    }

    // ── Insert seed data ─────────────────────────────────────────────────────
    const result = await db.collection('products').insertMany(PRODUCTS);
    console.log(`✅ Inserted ${result.insertedCount} products into '${DB_NAME}.products'`);

    // ── Create indexes for performance ────────────────────────────────────────
    await db.collection('products').createIndex({ category: 1 });
    await db.collection('products').createIndex({ name: 'text', description: 'text' });
    await db.collection('products').createIndex({ featured: -1, createdAt: -1 });

    await db.collection('orders').createIndex({ createdAt: -1 });
    await db.collection('orders').createIndex({ 'customer.email': 1 });
    await db.collection('orders').createIndex({ status: 1 });

    console.log('📑 Database indexes created');
    console.log('\n🚀 TITAN database ready! Your store has:');
    const categories = [...new Set(PRODUCTS.map(p => p.category))];
    categories.forEach(cat => {
      const count = PRODUCTS.filter(p => p.category === cat).length;
      console.log(`   • ${cat}: ${count} product${count > 1 ? 's' : ''}`);
    });

  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔒 Connection closed. Seed complete.');
  }
}

seed();