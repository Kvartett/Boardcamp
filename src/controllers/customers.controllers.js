import db from "../database/database.js";
import { customerSchema } from "../models/customer.model.js";

export async function findAll(req, res) {
    try {
        const { rows } = await db.query(`SELECT * FROM customers;`)
        res.send(rows)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function registerCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;

    const { error } = customerSchema.validate({ name, phone, cpf, birthday }, { abortEarly: false })

    if (error) {
        const errors = error.details.map((detail) => detail.message)
        return res.status(400).send(errors)
    }

    try {
        const cpfExist = await db.query(`SELECT * FROM customers WHERE cpf=$1;`, [cpf]);

        if (cpfExist.rows.length > 0) {
            return res.status(409).send("Cliente ja cadastrado!")
        }

        await db.query(`INSERT INTO customers (name, phone, cpf, birthday) VALUES ($1, $2, $3, $4);`, [name, phone, cpf, birthday])
        return res.sendStatus(201)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function findCustomerById(req, res) {
    const { id } = req.params;
    try {
        const customer = await db.query(`SELECT * FROM customers WHERE id=$1;`, [id]);

        if (customer.rows.length === 0) {
            return res.status(404).send("ID de cliente inexistente!")
        }

        res.send(customer.rows);
    } catch (err) {
        return res.status(500).send(err.message)
    }
}

export async function updateCustomer(req, res) {
    const { name, phone, cpf, birthday } = req.body;
    const { id } = req.params;

    try {
        await db.query(`UPDATE customers SET name=$1, phone=$2, cpf=$3, birthday=$4 WHERE id=$5;`, [name, phone, cpf, birthday, id]);
        res.sendStatus(200)
    } catch (err) {
        return res.status(500).send(err.message)
    }
}