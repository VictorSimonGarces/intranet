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
    const cfg: any = {
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
    this.pool = await new sql.ConnectionPool(cfg).connect()
  }

  async query(url: string, tiempo?: string): Promise<any | null> {
    if (!this.pool) throw new Error('Not connected')
    try {
      // Normalize URL to improve matching (strip query, fragment, trailing slash, lowercase)
      const normalizeUrl = (u: string) => {
        try {
          const parsed = new URL(u)
          const normalized = (parsed.origin + parsed.pathname).replace(/\/$/, '')
          return normalized.toLowerCase()
        } catch (e) {
          // fallback to regex-based stripping
          return u.replace(/\?.*$/, '').replace(/#.*$/, '').replace(/\/$/, '').toLowerCase()
        }
      }

      const normalized = normalizeUrl(url)

      // Parametrized query; fetch latest matching by normalized url
      const request = this.pool.request()
      // Use generous NVARCHAR sizes to avoid truncation
      request.input('url', sql.NVarChar(4000), normalized)
      request.input('urlLike', sql.NVarChar(4000), `%${normalized}%`)
      if (tiempo) request.input('tiempo', sql.NVarChar(100), tiempo)

      const q = `SELECT TOP 1 [id_sesion],[nameplate],[tiempo],[url],[title],[referer],[userAgent],[tipo],[datos]
                 FROM [EstadisticasIntranet].[dbo].[SesionEvento]
                 WHERE ([url] = @url OR [url] LIKE @urlLike OR @url LIKE '%' + @url + '%')
                 ORDER BY [tiempo] DESC`

      // Debug info: log the query parameters (not the full SQL to avoid verbosity)
      console.debug('[DB] query params', { url: normalized, tiempo: tiempo || null })

      const result = await request.query(q)
      const rows = result && result.recordset ? result.recordset.length : 0
      console.debug(`[DB] rows=${rows} for url='${normalized}'`)
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
