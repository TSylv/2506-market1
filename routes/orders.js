import express from "express";
import db from "../db/client.js";
import requireUser from "../middleware/requireUser.js";

const router = express.Router();

router.get("/", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await db.query(
      `
      SELECT id, date, note, user_id
      FROM orders
      WHERE user_id = $1;
      `,
      [userId]
    );

    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});


router.post("/", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { note } = req.body;

   const {
  rows: [order],
} = await db.query(
  `
      INSERT INTO orders (date, note, user_id)
      VALUES (NOW(), $1, $2)
      RETURNING id, date, note, user_id;
      `,
  [note, userId]
);


    res.status(201).send(order);
  } catch (err) {
    next(err);
  }
});


router.get("/:id", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const {
      rows: [order],
    } = await db.query(
      `
      SELECT id, date, note, user_id
      FROM orders
      WHERE id = $1
      AND user_id = $2;
      `,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    res.send(order);
  } catch (err) {
    next(err);
  }
});


router.post("/:id/products", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    const { product_id, quantity } = req.body;

    const {
      rows: [order],
    } = await db.query(
      `
        SELECT id, user_id
        FROM orders
        WHERE id = $1
        AND user_id = $2;
      `,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    const {
  rows: [orderProduct],
} = await db.query(
  `
        INSERT INTO orders_products (order_id, product_id, quantity)
        VALUES ($1, $2, $3)
        RETURNING order_id, product_id, quantity;
      `,
  [orderId, product_id, quantity]
);


    res.status(201).send(orderProduct);
  } catch (err) {
    next(err);
  }
});


router.get("/:id/products", requireUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;

    const {
      rows: [order],
    } = await db.query(
      `
        SELECT id, user_id
        FROM orders
        WHERE id = $1
        AND user_id = $2;
      `,
      [orderId, userId]
    );

    if (!order) {
      return res.status(404).send({ message: "Order not found" });
    }

    const result = await db.query(
      `
        SELECT
          products.id,
          products.title,
          products.description,
          products.price,
          orders_products.quantity
        FROM orders_products
        JOIN products
          ON products.id = orders_products.product_id
        WHERE orders_products.order_id = $1;
      `,
      [orderId]
    );

    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});

export default router;
