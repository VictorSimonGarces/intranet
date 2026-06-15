import sql from 'mssql'

export type DBConfig = {
  server: string,
  database: string,
  user: string,
  password: string,
  port?: number
}

export class DatabaseService {
  private pool?: sql.ConnectionPool
  constructor(private config: DBConfig) {}

  async connect(): Promise<void> {
    if (this.pool && this.pool.connected) return
    const useWindowsAuth = (process.env.DB_AUTH === 'windows') || !this.config.user
    let cfg: any
    if (useWindowsAuth) {
      // Use msnodesqlv8 driver with an explicit ODBC connection string that
      // forces Trusted Connection (use currently logged Windows user)
      const envConnStr = process.env.DB_CONNECTION_STRING
      const defaultDriverName = 'ODBC Driver 17 for SQL Server'
      const connStr = envConnStr || `Driver={${defaultDriverName}};Server=${this.config.server};Database=${this.config.database};Trusted_Connection=yes;`;
      cfg = {
        connectionString: connStr,
        driver: 'msnodesqlv8',
        options: {
          trustServerCertificate: true
        }
      }
      console.info('[DB] Using Windows Authentication via ODBC connection string with msnodesqlv8.')
    } else {
      cfg = {
        user: this.config.user,
        password: this.config.password,
        server: this.config.server,
        database: this.config.database,
        options: {
          encrypt: false,
          trustServerCertificate: true
        }
      }
      if (this.config.port) cfg.port = this.config.port
    }

    this.pool = await new sql.ConnectionPool(cfg).connect()
  }

  async query(titleOrKey: string, tiempo?: string): Promise<any | null> {
    if (!this.pool) throw new Error('Not connected')
    try {
      // Normalize title/key for matching (trim, lowercase)
      const normalizeKey = (s: string) => {
        try {
          return String(s || '').trim().toLowerCase()
        } catch (e) {
          return String(s || '').toLowerCase()
        }
      }

      const normalized = normalizeKey(titleOrKey)

      // Parametrized query; fetch latest matching by normalized title
      const request = this.pool.request()
      // Use generous NVARCHAR sizes to avoid truncation
      request.input('key', sql.NVarChar(4000), normalized)
      request.input('keyLike', sql.NVarChar(4000), `%${normalized}%`)
      if (tiempo) request.input('tiempo', sql.NVarChar(100), tiempo)

      const q = `SELECT TOP 1 [id_sesion],[numEmpleado],[tiempo],[url],[title],[referer],[userAgent],[tipo],[datos]
                 FROM [EstadisticasIntranet].[dbo].[SesionEvento]
                 WHERE (LOWER([title]) = @key OR LOWER([title]) LIKE @keyLike OR @key LIKE '%' + LOWER([title]) + '%')
                 ORDER BY [tiempo] DESC`

      // Debug info: log the query parameters (not the full SQL to avoid verbosity)
      console.debug('[DB] query params', { key: normalized, tiempo: tiempo || null })

      const result = await request.query(q)
      const rows = result && result.recordset ? result.recordset.length : 0
      console.debug(`[DB] rows=${rows} for title='${normalized}'`)
      if (rows > 0) return result.recordset[0]
    } catch (e) {
      console.error('[DB] query error', (e as Error).message)
      return null
    }
    return null
  }

  async disconnect(): Promise<void> {
    try {
      if (this.pool) await this.pool.close()
    } catch (e) { /* ignore */ }
    this.pool = undefined
  }
}
