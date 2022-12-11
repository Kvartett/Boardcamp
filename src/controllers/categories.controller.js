import db from "../database/database.js";
import { categorySchema } from "../models/category.model.js";


export async function findAll(req, res) {
    try {
        const { rows } = await db.query(`SELECT * FROM categories;`)
        res.send(rows)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function createCategory(req, res) {
    const { name } = req.body;

    const { error } = categorySchema.validate({ name }, { abortEarly: false })

    if (error) {
        return res.status(400).send({
            message: 'Invalid category name',
            details: error.details.map((e) => e.message),
        });
    }

    try {
        const categoryExist = await db.query(`SELECT * FROM categories WHERE name=$1;`, [name]);

        if (categoryExist.rows.length > 0) {
            return res.status(409).send("Categoria ja existente!")
        }

        await db.query(`INSERT INTO categories (name) VALUES ($1);`, [name])
        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}