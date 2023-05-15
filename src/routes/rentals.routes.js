import { Router } from "express";
import { db } from "../database/database.connection.js";
import dayjs from "dayjs";
import {
  deleteRental,
  endRental,
  getRentals,
  postRentals,
} from "../controllers/rentals.controllers.js";

const rentalsRouter = Router();

rentalsRouter.get("/rentals", getRentals);

rentalsRouter.post("/rentals", postRentals);

rentalsRouter.post("/rentals/:id/return", endRental);

rentalsRouter.delete("/rentals/:id", deleteRental);

export default rentalsRouter;
