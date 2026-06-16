import sql from 'mssql'

export type DBConfig = {
  server: string,
  database: string,
  user?: string,
  password?: string,
  port?: number
}

export class DatabaseService {
  private pool?: sql.ConnectionPool
  constructor(private config: DBConfig) {}

  async connect(): Promise<void> {
    if (this.pool && this.pool.connected) return

    const connStr = `Driver={ODBC Driver 18 for SQL Server};Server=${this.config.server};Database=${this.config.database};Trusted_Connection=yes;TrustServerCertificate=yes;`
    
    console.info('[DB] Using Windows Authentication via ODBC Driver 18')
    console.info(`[DB] Connecting to ${this.config.server} / ${this.config.database}`)

    const cfg: any = {
      connectionString: connStr,
      driver: 'msnodesqlv8'
    }

    this.pool = await new sql.ConnectionPool(cfg).connect()
  }

  async query(titleOrKey: string, tiempo?: string): Promise<any | null> {
    if (!this.pool) throw new Error('Not connected')
    try {
      const normalizeKey = (s: string) => String(s || '').trim().toLowerCase()
      const normalized = normalizeKey(titleOrKey)

      // Si se proporciona una URL completa, extraer pathname para buscar coincidencias parciales en la columna url
      let pathLike: string | null = null
      try {
        const u = new URL(titleOrKey)
        pathLike = `%${u.pathname.toLowerCase()}%`
      } catch (e) {
        pathLike = null
      }

      const request = this.pool.request()
      request.input('key', sql.NVarChar(4000), normalized)
      request.input('keyLike', sql.NVarChar(4000), `%${normalized}%`)
      if (tiempo) request.input('tiempo', sql.NVarChar(100), tiempo)
      if (pathLike) request.input('pathLike', sql.NVarChar(4000), pathLike)

      const q = `SELECT TOP 1 [id_sesion],[numEmpleado],[tiempo],[url],[title],[referer],[userAgent],[tipo],[datos]
                 FROM [EstadisticasIntranet].[dbo].[SesionEvento]
                 WHERE (
                   LOWER([title]) = @key OR LOWER([title]) LIKE @keyLike OR @key LIKE '%' + LOWER([title]) + '%'
                   OR LOWER([url]) = @key OR LOWER([url]) LIKE @keyLike ${pathLike ? 'OR LOWER([url]) LIKE @pathLike' : ''}
                 )
                 ORDER BY [tiempo] DESC`

      console.debug('[DB] query params', { original: titleOrKey, key: normalized, pathLike: pathLike || null, tiempo: tiempo || null })

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