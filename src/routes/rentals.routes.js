import { Router } from "express";
import { db } from "../database/database.connection.js";
import { rentalsSchema } from "../schemas/rentals.schema.js";
import dayjs from "dayjs";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", async (req, res) => {
  try {
    const rents = await db.query(`
    SELECT *, TO_CHAR("rentDate", 'YYYY-MM-DD') AS "rentDate", games.name AS "gameName", rentals.id AS "id" FROM rentals
        JOIN games ON rentals."gameId"=games.id
        JOIN customers ON rentals."customerId"=customers.id;
    `);

    const rentsFormat = rents.rows.map((rent) => {
      return {
        id: rent.id,
        customerId: rent.customerId,
        gameId: rent.gameId,
        rentDate: rent.rentDate,
        daysRented: rent.daysRented,
        returnDate: rent.returnDate,
        originalPrice: rent.originalPrice,
        delayFee: rent.delayFee,
        customer: {
          id: rent.customerId,
          name: rent.name,
        },
        game: {
          id: rent.gameId,
          name: rent.gameName,
        },
      };
    });

    res.send(rentsFormat);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

rentalsRouter.post("/rentals", async (req, res) => {
  const { customerId, gameId, daysRented } = req.body;

  const validation = rentalsSchema.validate({
    customerId,
    gameId,
    daysRented,
  });

  let gamePricePerDay;

  if (validation.error) return res.sendStatus(400);

  try {
    const getCustomer = await db.query(
      `SELECT * FROM customers WHERE id='${customerId}';`
    );

    const getGame = await db.query(`SELECT * FROM games WHERE id='${gameId}';`);

    if (!getCustomer.rows[0] || !getGame.rows[0]) return res.sendStatus(400);

    const getRentals = await db.query(
      `SELECT * FROM rentals WHERE "gameId"='${gameId}';`
    );

    for (let i = 0; i < getRentals.rows.length; i++) {
      if (i >= getGame.rows[0].stockTotal - 1) return res.sendStatus(400);
    }

    gamePricePerDay = getGame.rows[0].pricePerDay;
  } catch (err) {
    return res.status(500).send(err.message);
  }

  const originalPrice = daysRented * gamePricePerDay;
  const rentDate = dayjs().format("YYYY-MM-DD");

  try {
    await db.query(`
    INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "originalPrice") 
    VALUES ('${customerId}', '${gameId}', '${rentDate}', '${daysRented}', '${originalPrice}');`);

    res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

export default rentalsRouter;
