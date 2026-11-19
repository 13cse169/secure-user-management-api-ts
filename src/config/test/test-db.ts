import pool from '../db.js';

const testConnection = async () : Promise<void> => {
    try {
        const result = await pool.query("SELECT NOW()");

        console.log("Database created successfully!");
        console.log("Database time: ", result.rows[0].now);
    } catch (error) {
        console.log("Database connection failed: ", error);
    } finally {
        await pool.end();
    }
};

testConnection();

// This runs a simple SQL query to check whether the database is reachable. pool.end() closes the connections when the test finishes.

// Run the test: npx tsx src/config/test-db.ts