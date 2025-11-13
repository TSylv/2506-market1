import "dotenv/config";
import bcrypt from "bcrypt";
import db from "#db/client";

await db.connect();
await seed();
await db.end();
console.log("🌱 Database seeded.");

async function seed() {
  const products = [
    { title: "PC Case", description: "ATX mid-tower computer case with tempered glass side panel", price: 89.99 },
    { title: "Power Supply Unit", description: "750W 80+ Gold certified fully modular PSU", price: 119.99 },
    { title: "Graphics Card", description: "High-performance GPU suitable for gaming and video editing", price: 599.99 },
    { title: "CPU", description: "8-core, 16-thread processor for multitasking and gaming", price: 329.99 },
    { title: "Motherboard", description: "ATX motherboard with Wi-Fi and RGB support", price: 159.99 },
    { title: "RAM", description: "16GB DDR4 3200MHz memory kit", price: 69.99 },
    { title: "SSD", description: "1TB NVMe SSD with fast read/write speeds", price: 94.99 },
    { title: "CPU Cooler", description: "Dual-fan air cooler for optimal thermal performance", price: 49.99 },
    { title: "Case Fans", description: "RGB 120mm cooling fan pack (3-pack)", price: 39.99 },
    { title: "Wi-Fi Card", description: "PCIe Wi-Fi 6 wireless adapter", price: 29.99 }
  ];


  for (const product of products) {
    await db.query(
      `INSERT INTO products (title, description, price)
       VALUES ($1, $2, $3);`,
       [product.title, product.description, product.price]
    );
  }


const hashedPassword = await bcrypt.hash("password123", 10);
  const userResult = await db.query(
    `INSERT INTO users (username, password)
     VALUES ($1, $2)
     RETURNING id;`,
    ["testuser", hashedPassword]
  );
  const userId = userResult.rows[0].id;


const orderResult = await db.query(
    `INSERT INTO orders (date, note, user_id)
     VALUES (NOW(), 'First order', $1)
     RETURNING id;`,
    [userId]
  );
  const orderId = orderResult.rows[0].id;


const productsResult = await db.query(
    `SELECT id FROM products ORDER BY id LIMIT 5;`
  );
  const productIds = productsResult.rows.map((row) => row.id);

  for (const productId of productIds) {
    await db.query(
      `INSERT INTO orders_products (order_id, product_id, quantity)
       VALUES ($1, $2, $3);`,
      [orderId, productId, 1]
    );
  }
}