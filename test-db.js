require('dotenv').config()
const sql = require('mssql')

async function run() {
  const cfg = {
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'master'
  }
  // Support Windows Auth when DB_AUTH=windows or DB_USER is not set
  const useWindowsAuth = (process.env.DB_AUTH === 'windows') || !process.env.DB_USER
  if (!useWindowsAuth) {
    cfg.user = process.env.DB_USER || undefined
    cfg.password = process.env.DB_PASSWORD || undefined
    cfg.port = process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined
    cfg.options = { encrypt: false, trustServerCertificate: true }
  } else {
    // msnodesqlv8 config
    cfg.driver = 'msnodesqlv8'
    cfg.options = { trustedConnection: true, trustServerCertificate: true }
    if (process.env.DB_PORT) cfg.port = Number(process.env.DB_PORT)
  }

  console.log('Attempting DB connection to', cfg.server, '/', cfg.database, 'useWindowsAuth=', useWindowsAuth)
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
