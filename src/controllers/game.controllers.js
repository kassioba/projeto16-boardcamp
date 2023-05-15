import { db } from "../database/database.connection.js";
import { gameSchema } from "../schemas/game.schema.js";

export async function getGames(req, res) {
  res.send((await db.query("SELECT * FROM games")).rows);
}

export async function postGames(req, res) {
  const { name, image, stockTotal, pricePerDay } = req.body;

  const validation = gameSchema.validate({
    name,
    image,
    stockTotal,
    pricePerDay,
  });

  if (validation.error) return res.sendStatus(400);

  try {
    const nameCheck = await db.query(
      `SELECT * FROM games WHERE name='${name}'`
    );

    if (nameCheck.rowCount >= 1) {
      return res.sendStatus(409);
    }
  } catch (err) {
    res.status(500).send(err.message);
  }

  try {
    await db.query(
      `INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ('${name}', '${image}', ${stockTotal}, ${pricePerDay});`
    );

    res.sendStatus(201);
  } catch (err) {
    res.status(500).send(err.message);
  }
}
