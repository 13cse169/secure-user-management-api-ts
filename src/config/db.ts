import pg from "pg";
import "dotenv/config";

// Pool manages a collection of reusable database connections.
const { Pool } = pg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 2124,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

export default pool;

// Why use a pool? If 100 requests arrive, we don't want to open 100 new database connections. The pool reuses connections and limits how many can be active at once.