import coreJoi from "joi";
import joiDate from "@joi/date";

const joi = coreJoi.extend(joiDate);

const customersSchema = joi.object({
  name: joi.string().required(),
  phone: joi.string().min(10).max(11).required(),
  cpf: joi
    .string()
    .length(11)
    .pattern(/^[0-9]+$/)
    .required(),
  birthday: joi.date().format("YYYY-MM-DD").required(),
});

export default customersSchema;
