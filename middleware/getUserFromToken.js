import db from "../db/client.js";
import { verifyToken } from "../utils/jwt.js";

export default async function getUserFromToken(req, res, next) {
  const authorization = req.get("authorization");

  if (!authorization || !authorization.startsWith("Bearer ")) return next();

  const token = authorization.split(" ")[1];

  try {
    const { id } = verifyToken(token);

    const result = await db.query(
      `SELECT id, username FROM users WHERE id = $1`,
      [id]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).send("Invalid token.");
    }

    req.user = user;
    next();
  } catch (e) {
    console.error(e);
    res.status(401).send("Invalid token.");
  }
}
