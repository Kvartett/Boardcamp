import db from "../database/database.js";
import { gameSchema } from "../models/games.model.js";

export async function findAll(req, res) {
    try {
        const { rows } = await db.query(`SELECT * FROM games;`)
        res.send(rows)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function createGames(req, res) {
    const { name, image, stockTotal, categoryId, pricePerDay } = req.body;

    const { error } = gameSchema.validate({ name, image, stockTotal, categoryId, pricePerDay }, { abortEarly: false })

    if (error) {
        const errors = error.details.map((detail) => detail.message)
        return res.status(422).send(errors)
    }

    if (stockTotal === 0 || pricePerDay === 0) {
        return res.status(400).send("Favor colocar um estoque e valor por dia valido!")
    }

    try {
        const categoryExist = await db.query(`SELECT * FROM categories WHERE id=$1;`, [categoryId]);

        if (!categoryExist.rows.length > 0) {
            return res.status(400).send("Categoria não existente!")
        }

        await db.query(`INSERT INTO games (name, image, "stockTotal", "categoryId", "pricePerDay") VALUES ($1, $2, $3, $4, $5);`, [name, image, stockTotal, categoryId, pricePerDay])
        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}