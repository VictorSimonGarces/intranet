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
      // Parametrized query; fetch latest matching by url
      const request = this.pool.request()
      // Provide both exact and partial (LIKE) match to tolerate minor differences
      request.input('url', sql.NVarChar, url)
      request.input('urlLike', sql.NVarChar, `%${url}%`)
      // If tiempo provided, pass it as well
      if (tiempo) request.input('tiempo', sql.NVarChar, tiempo)

      const q = `SELECT TOP 1 [id_sesion],[nameplate],[tiempo],[url],[title],[referer],[userAgent],[tipo],[datos]
                 FROM [EstadisticasIntranet].[dbo].[SesionEvento]
                 WHERE ([url] = @url OR [url] LIKE @urlLike OR @url LIKE '%' + [url] + '%')
                 ORDER BY [tiempo] DESC`

      const result = await request.query(q)
      if (result && result.recordset && result.recordset.length > 0) return result.recordset[0]
    } catch (e) {
      // ignore or rethrow depending on needs
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
