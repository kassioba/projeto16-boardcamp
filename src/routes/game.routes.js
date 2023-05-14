import { Router } from "express"
import {db} from '../database/database.connection.js'
import joi from 'joi'

const gameRouter = Router()

gameRouter.get('/games', async (req, res) => {
    res.send((await db.query("SELECT * FROM games")).rows)
})

gameRouter.post('/games', async (req, res) =>{
    const {name, image, stockTotal, pricePerDay} = req.body

    const validation = gameSchema.validate({
        name,
        image,
        stockTotal,
        pricePerDay
    })

    if(validation.error) return res.sendStatus(400);

    try{
        const checagemNome = await db.query(`SELECT * FROM games WHERE name='${name}'`)
        
        if(checagemNome.rowCount >= 1){
            return res.sendStatus(409)
        }
    }catch(err){
        res.status(500).send(err.message);
    }

    try{
        await db.query(`INSERT INTO games (name, image, "stockTotal", "pricePerDay") VALUES ('${name}', '${image}', ${stockTotal}, ${pricePerDay});`)

        res.sendStatus(201)
    }catch(err){
        res.status(500).send(err.message);
    }
})

const gameSchema = joi.object({
    name: joi.string().required(),
    image: joi.string(),
    stockTotal: joi.number().min(1).required(),
    pricePerDay: joi.number().min(1).required(),
})

export default gameRouter