import express from "express";
import db from "../db/client.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query(
      "SELECT id, title, description, price FROM products;"
    );
    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});


router.get("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `SELECT id, title, description, price
       FROM products
       WHERE id = $1;`,
      [id]
    );

    const product = result.rows[0];

    if (!product) {
      return res.status(404).send({ message: "Product not found" });
    }

    res.send(product);
  } catch (err) {
    next(err);
  }
});


router.get("/:id/orders", async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await db.query(
      `
      SELECT 
        o.id AS order_id,
        o.date,
        o.note,
        o.user_id,
        op.quantity
      FROM orders o
      JOIN orders_products op ON o.id = op.order_id
      WHERE op.product_id = $1;
      `,
      [id]
    );

    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});


export default router;
