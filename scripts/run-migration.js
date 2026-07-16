
const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('DATABASE_URL not set');
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const client = await pool.connect();

  try {
    const sql = fs.readFileSync(path.join(__dirname, '..', 'scripts', 'migrate-to-neon.sql'), 'utf8');
    console.log('Executing migration...');
    await client.query(sql);
    console.log('Migration completed successfully');
    
    // Verify tables
    const { rows } = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('Tables created:', rows.map(r => r.table_name).join(', '));
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
