const { MongoClient } = require("mongodb");

const uri = "mongodb://localhost:27017";
const client = new MongoClient(uri);

async function main() {
  try {
    await client.connect();
    console.log("Database connected successfully");

    const db = client.db("shop");
    const products = db.collection("products");

    const allProducts = await products.find().toArray();

    console.log(`Total products found: ${allProducts.length}`);
    console.log("\n--- Product List ---");

    allProducts.forEach((product) => {
      console.log(`Name: ${product.name} | Category: ${product.category} | Price: $${product.price}`);
    });

  } catch (err) {
    console.error("Connection failed:", err.message);

  } finally {
    await client.close();
    console.log("\nConnection closed.");
  }
}

main();