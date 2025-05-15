import { Client } from "pg";
import dotenv from 'dotenv';

dotenv.config();

const client = new Client(process.env.DATABASE_URL);

export async function initializeDB() {
  try {
    await client.connect();
    console.log('Connected to the database');
    
    // Test query
    const results = await client.query('SELECT NOW()');
    console.log('Database time:', results.rows[0]);
  } catch (err) {
    console.error('Error connecting to the database:', err);
  }
}

export default client;