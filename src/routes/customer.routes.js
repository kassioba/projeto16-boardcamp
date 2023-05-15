import { Router } from "express";
import {
  editCustomer,
  getCustomerById,
  getCustomers,
  postCustomer,
} from "../controllers/customer.controllers.js";

const customersRouter = Router();

customersRouter.get("/customers", getCustomers);

customersRouter.get("/customers/:id", getCustomerById);

customersRouter.post("/customers", postCustomer);

customersRouter.put("/customers/:id", editCustomer);

export default customersRouter;
