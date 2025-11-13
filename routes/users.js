import express from "express";
import db from "../db/client.js";
import requireUser from "../middleware/requireUser.js";
import requireBody from "../middleware/requireBody.js";
import bcrypt from "bcrypt";
import { createToken } from "../utils/jwt.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const result = await db.query("SELECT id, username FROM users;");
    res.send(result.rows);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/register",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const result = await db.query(
        `INSERT INTO users (username, password)
         VALUES ($1, $2)
         RETURNING id, username;`,
        [username, hashedPassword]
      );

      const user = result.rows[0];

      const token = createToken({ id: user.id });

      res.status(201).send({ user, token });
    } catch (err) {
      next(err);
    }
  }
);

router.post(
  "/login",
  requireBody(["username", "password"]),
  async (req, res, next) => {
    try {
      const { username, password } = req.body;

      const result = await db.query(
        `SELECT id, username, password
         FROM users
         WHERE username = $1;`,
        [username]
      );

      const user = result.rows[0];

      if (!user) {
        return res.status(401).send({ message: "Invalid username or password" });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).send({ message: "Invalid username or password" });
      }

      const token = createToken({ id: user.id });

      res.send({
        user: { id: user.id, username: user.username },
        token,
      });

    } catch (err) {
      next(err);
    }
  }
);

export default router;