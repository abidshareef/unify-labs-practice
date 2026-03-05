const { MongoClient, ServerApiVersion } = require("mongodb");
const dns = require("dns");

// Force Google DNS
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const uri = "mongodb+srv://mohdabidullahshareef_db_user:onsu89iKzPWsyS92@cluster0.igprxbl.mongodb.net/?appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function main() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Connected to MongoDB Atlas successfully!");

    const db = client.db("shop");
    const products = db.collection("products");

    const allProducts = await products.find().toArray();
    console.log(`📦 Total products found: ${allProducts.length}`);
    console.log("\n--- Product List ---");

    allProducts.forEach((product) => {
      console.log(`Name: ${product.name} | Category: ${product.category} | Price: $${product.price}`);
    });

  } catch (err) {
    console.error("❌ Connection failed:", err.message);

  } finally {
    await client.close();
    console.log("\n🔒 Connection closed.");
  }
}

main();