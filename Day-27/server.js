const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
app.use(express.json());

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);
let products;

async function startServer() {
  try {
    await client.connect();
    console.log("Database connected successfully");

    const db = client.db("shop");
    products = db.collection("products");

    app.listen(3000, () => {
      console.log("Server running on http://localhost:3000");
    });

  } catch (err) {
    console.error("Failed to connect:", err.message);
    process.exit(1);
  }
}

// GET - Fetch all products
app.get("/products", async (req, res) => {
  try {
    const all = await products.find().toArray();
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST - Add a new product
app.post("/products", async (req, res) => {
  try {
    const { name, price, stock } = req.body;
    if (!name || !price || !stock) {
      return res.status(400).json({ error: "name, price and stock are required" });
    }
    const result = await products.insertOne({ name, price, stock });
    res.status(201).json({ message: "Product added", id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH - Update stock only
app.patch("/products/:id", async (req, res) => {
  try {
    const { stock } = req.body;
    if (stock === undefined) {
      return res.status(400).json({ error: "stock field is required" });
    }
    const result = await products.updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { stock } }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE - Remove a product
app.delete("/products/:id", async (req, res) => {
  try {
    const result = await products.deleteOne(
      { _id: new ObjectId(req.params.id) }
    );
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

startServer();