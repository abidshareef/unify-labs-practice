const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
app.use(express.json());
const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

// ── Serverless-Safe DB Connection ─────────────────────────────────────────
let db;
let client;

async function connectDB() {
    if (db) return db; // reuse existing connection on warm starts
    client = new MongoClient(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
    });
    await client.connect();
    db = client.db('zenith_cms');
    console.log('✅ Connected to Cloud Database');
    return db;
}

// Middleware — ensures DB is connected before every request
app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        console.error('❌ DB Connection Failed:', err.message);
        res.status(500).json({ error: 'Database connection failed' });
    }
});

// ── GET ALL POSTS ─────────────────────────────────────────────────────────
app.get('/api/posts', async (req, res) => {
    try {
        const posts = await db.collection('blogs').find().sort({ date: -1 }).toArray();
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch posts' });
    }
});

// ── GET SINGLE POST ───────────────────────────────────────────────────────
app.get('/api/posts/:id', async (req, res) => {
    try {
        const post = await db.collection('blogs').findOne({ _id: new ObjectId(req.params.id) });
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch post' });
    }
});

// ── CREATE POST ───────────────────────────────────────────────────────────
app.post('/api/posts', async (req, res) => {
    try {
        const { title, content, author, tag } = req.body;
        if (!title || !content || !author) {
            return res.status(400).json({ error: 'Title, content, and author are required' });
        }
        const newPost = { title, content, author, tag: tag || 'General', date: new Date() };
        const result  = await db.collection('blogs').insertOne(newPost);
        res.status(201).json({ message: 'Post Created!', id: result.insertedId });
    } catch (err) {
        res.status(500).json({ error: 'Failed to create post' });
    }
});

// ── UPDATE POST ───────────────────────────────────────────────────────────
app.put('/api/posts/:id', async (req, res) => {
    try {
        const { title, content, author, tag } = req.body;
        await db.collection('blogs').updateOne(
            { _id: new ObjectId(req.params.id) },
            { $set: { title, content, author, tag, updatedAt: new Date() } }
        );
        res.json({ message: 'Post Updated!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update post' });
    }
});

// ── DELETE POST ───────────────────────────────────────────────────────────
app.delete('/api/posts/:id', async (req, res) => {
    try {
        await db.collection('blogs').deleteOne({ _id: new ObjectId(req.params.id) });
        res.json({ message: 'Post Deleted!' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete post' });
    }
});

// ── Start Server ──────────────────────────────────────────────────────────
// Only listen locally — Vercel handles this itself
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}

module.exports = app;