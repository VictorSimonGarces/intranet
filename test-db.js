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
    console.log('Attempting DB connection to', cfg.server, '/', cfg.database, 'useWindowsAuth=', useWindowsAuth)
  } else {
    // msnodesqlv8 via ODBC connection string: force Trusted_Connection=yes and do NOT pass user/password
    const defaultDriverName = 'ODBC Driver 18 for SQL Server'
    const connStr = process.env.DB_CONNECTION_STRING || `Driver={${defaultDriverName}};Server=${cfg.server};Database=${cfg.database};Trusted_Connection=yes;`
    // ensure we do NOT include user/password in cfg
    const winCfg = {
      connectionString: connStr,
      driver: 'msnodesqlv8',
      options: { trustServerCertificate: true }
    }
    if (process.env.DB_PORT) winCfg.port = Number(process.env.DB_PORT)
    // replace cfg with winCfg to avoid accidental user/password usage
    Object.assign(cfg, winCfg)
    console.log('Attempting DB connection via ODBC connection string (Windows Auth).')
    console.log('Connection string (hidden details):', connStr.replace(/(Password=)[^;]*/i, '$1****'))
  }
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
