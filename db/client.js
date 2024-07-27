require("dotenv").config();
const { Client } = require("pg");
const client = new Client({
  connectionString: `postgresql://postgres.uesfmmxazhjihluoccof:${process.env.SUPABASE_PASS}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`,
});
client.connect();

module.exports = { client: client };
