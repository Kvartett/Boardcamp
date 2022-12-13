import db from "../database/database.js";
import dayjs from "dayjs";
import { rentSchema } from "../models/rent.model.js";
dayjs.locale("pt-br")

export async function findAll(req, res) {
    try {
        const { rows } = await db.query(`SELECT * FROM rentals;`)
        res.send(rows)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function registerRent(req, res) {
    const { customerId, gameId, daysRented } = req.body;

    const { error } = rentSchema.validate({ customerId, gameId, daysRented }, { abortEarly: false })

    if (error) {
        const errors = error.details.map((detail) => detail.message)
        return res.status(400).send(errors)
    }

    const returnDate = null;
    const delayFee = null;
    const rentDate = dayjs().format('YYYY/MM/DD');
    const gameExist = await db.query(`SELECT * FROM games WHERE id=$1;`, [gameId]);

    if (gameExist.rows.length === 0) {
        return res.status(400).send("Jogo não existe!");
    }

    if (gameExist.rows.stockTotal === 0) {
        return res.status(400).send("Jogo fora de estoque!");
    }

    const customerExist = await db.query(`SELECT * FROM customers WHERE id=$1;`, [customerId]);

    if (customerExist.rows.length === 0) {
        return res.status(400).send("Cliente inexistente!");
    }

    const newStockTotal = gameExist.rows[0].stockTotal - 1;
    const originalPrice = gameExist.rows[0].pricePerDay * daysRented;

    try {
        await db.query(`INSERT INTO rentals ("customerId", "gameId", "rentDate", "daysRented", "returnDate", "originalPrice", "delayFee") VALUES ($1, $2, $3, $4, $5, $6, $7);`, [customerId, gameId, rentDate, daysRented, returnDate, originalPrice, delayFee])

        await db.query(`UPDATE games SET "stockTotal"=$1 WHERE id=$2;`, [newStockTotal, gameId])

        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function endRent(req, res) {
    const { id } = req.params;

    const rentExist = await db.query(`SELECT * FROM rentals WHERE id=$1;`, [id]);

    if (rentExist.rows.length === 0) {
        return res.status(404).send("Aluguel não registrado!")
    }

    const returnDate = new Date(dayjs().format("YYYY/MM/DD"));
    const rentDate = new Date(rentExist.rows[0].rentDate);

    const calcDays = Math.abs(returnDate.getTime() - rentDate.getTime());
    const updateDelayFee = Math.ceil(calcDays / (1000 * 3600 * 24));

    const originalGamePrice = await db.query(`SELECT * FROM games WHERE id=$1`, [rentExist.rows[0].gameId])

    const valueFee = updateDelayFee * originalGamePrice.rows[0].pricePerDay;

    try {
        await db.query(`UPDATE rentals SET "returnDate"=$1, "delayFee"=$2 WHERE id=$3`, [returnDate, valueFee, id])
        res.sendStatus(200)
    } catch (err) {
        return res.status(500).send(err.message);
    }
}

export async function removeRent(req, res) {
    const { id } = req.params;

    try {
        const rent = await db.query('SELECT * FROM rentals WHERE id=$1;', [id]);

        if (rent.rows.length === 0) {
            return sendStatus(404);
        }

        if (rent.rows[0].returnDate === null) {
            return res.sendStatus(400);
        }

        await db.query('DELETE FROM rentals WHERE id=$1;', [id])
        res.sendStatus(200);

    } catch (err) {
        return res.status(500).send(err.message);
    }
}