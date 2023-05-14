import { Router } from "express";
import { db } from "../database/database.connection.js";
import customersSchema from "../schemas/customers.schema.js";

const customersRouter = Router();

customersRouter.get("/customers", async (req, res) => {
  res.send(
    (
      await db.query(
        "SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers"
      )
    ).rows
  );
});

customersRouter.get("/customers/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const getCustomerById = await db.query(
      `SELECT *, TO_CHAR(birthday, 'YYYY-MM-DD') AS birthday FROM customers WHERE id=$1`,
      [id]
    );

    if (getCustomerById.rowCount === 0) {
      return res.sendStatus(404);
    }

    res.send(getCustomerById.rows[0]);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

customersRouter.post("/customers", async (req, res) => {
  const { name, phone, cpf, birthday } = req.body;

  const validation = customersSchema.validate({
    name,
    phone,
    cpf,
    birthday,
  });

  if (validation.error) return res.sendStatus(400);

  try {
    const cpfCheck = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [
      cpf,
    ]);

    if (cpfCheck.rowCount >= 1) return res.sendStatus(409);
  } catch (err) {
    return res.status(500).send(err.message);
  }

  try {
    await db.query(
      `INSERT INTO customers (name, phone, cpf, birthday) VALUES ('${name}','${phone}', '${cpf}', '${birthday}');`
    );

    res.sendStatus(201);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

customersRouter.put("/customers/:id", async (req, res) => {
  const id = req.params.id;
  const { name, phone, cpf, birthday } = req.body;

  const validation = customersSchema.validate({
    name,
    phone,
    cpf,
    birthday,
  });

  if (validation.error) return res.sendStatus(400);

  try {
    const cpfCheck = await db.query(`SELECT * FROM customers WHERE cpf=$1`, [
      cpf,
    ]);

    // forEach
    for (let i = 0; i < cpfCheck.rows.length; i++) {
      if (cpfCheck.rows[i].cpf === cpf && cpfCheck.rows[i].id !== Number(id))
        return res.sendStatus(409);
    }
  } catch (err) {
    return res.status(500).send(err.message);
  }

  try {
    await db.query(
      `UPDATE customers SET name='${name}', phone='${phone}', cpf='${cpf}', birthday='${birthday}' WHERE id=$1`,
      [id]
    );

    res.sendStatus(200);
  } catch (err) {
    return res.status(500).send(err.message);
  }
});

export default customersRouter;
