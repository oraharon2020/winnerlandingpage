import { Pool } from "pg";

// Connection string from environment variable
// Format: postgresql://user:password@host:port/database
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.warn("DATABASE_URL not set — admin dashboard will not work");
}

const pool = connectionString
  ? new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false }, // Required for Heroku/Supabase
      max: 5,
    })
  : null;

export default pool;
