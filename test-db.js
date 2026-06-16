require('dotenv').config()
const sql = require('mssql/msnodesqlv8')

async function run() {
  const connStr = `Driver={ODBC Driver 18 for SQL Server};Server=${process.env.DB_SERVER};Database=${process.env.DB_NAME};Trusted_Connection=yes;TrustServerCertificate=yes;`
  
  console.log('Connecting with:', connStr)

  try {
    await sql.connect({ connectionString: connStr })
    console.log('Connected ✅')

    const result = await sql.query`SELECT TOP 5 * FROM [EstadisticasIntranet].[dbo].[SesionEvento] ORDER BY tiempo DESC`
    
    if (result.recordset.length > 0) {
      console.log('Sample row:')
      
      result.recordset.forEach((row, index) => {
        console.log(`Row ${index + 1}:`)
        console.dir(row, { depth: 2 })
      })

    } else {
      console.log('Query returned no rows')
    }

    await sql.close()
    process.exit(0)
  } catch (err) {
    console.error('Error:', err.message)
    try { await sql.close() } catch(e) {}
    process.exit(1)
  }
}

run()