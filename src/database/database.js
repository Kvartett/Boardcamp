import dotenv from "dotenv";
import pg from 'pg';


const { Pool } = pg;
dotenv.config();

const databaseconfig = {
    connectionString: process.env.DATABASE_URL,
};

const db = new Pool(databaseconfig)

export default db;