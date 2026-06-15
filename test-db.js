require('dotenv').config()
const sql = require('mssql')

async function run() {
  const cfg = {
    user: process.env.DB_USER || undefined,
    password: process.env.DB_PASSWORD || undefined,
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'master',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined,
    options: {
      encrypt: false,
      trustServerCertificate: true
    }
  }

  console.log('Attempting DB connection to', cfg.server, '/', cfg.database)
  try {
    await sql.connect(cfg)
    console.log('Connected ✅')
    const q = `SELECT TOP 1 * FROM [EstadisticasIntranet].[dbo].[SesionEvento]`;
    const result = await sql.query(q)
    if (result && result.recordset && result.recordset.length > 0) {
      console.log('Sample row:')
      console.dir(result.recordset[0], { depth: 2 })
    } else {
      console.log('Query returned no rows')
    }
    await sql.close()
    process.exit(0)
  } catch (err) {
    console.error('Connection or query error:')
    console.error(err && err.message ? err.message : err)
    try { await sql.close() } catch(e){}
    process.exit(1)
  }
}

run()
