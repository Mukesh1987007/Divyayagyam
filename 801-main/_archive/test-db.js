const { Client } = require('pg');

const connectionString = "postgresql://postgres.ehiqtlofblrddauixeuz:Divya%40Yagyam%40123@aws-1-ap-northeast-2.pooler.supabase.com:6543/postgres?pgbouncer=true";

console.log('Testing direct PG client connection...');
const client = new Client({ connectionString });

client.connect()
  .then(() => {
    console.log('SUCCESS: Successfully connected to Supabase PostgreSQL!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Query result:', res.rows[0]);
    return client.end();
  })
  .catch(err => {
    console.error('ERROR: Connection failed!', err);
  });
