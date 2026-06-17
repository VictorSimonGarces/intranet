import { Locator, Page, Browser } from "@playwright/test"
import { DatabaseService } from '../../services/DatabaseService'

export class IntranetPage{

    private readonly userTextBox: Locator
    private readonly nextButton: Locator
    private readonly passwordTextBox: Locator
    private readonly signInButton: Locator
    private readonly laFirmaDropdown: Locator
    private readonly quienesSomosButton: Locator
    private readonly centroDeRecursosButton: Locator
    private readonly talentoButton: Locator
    private readonly comiteEjecutivoButton: Locator
    private readonly consejosSociosButton: Locator
    private readonly negociosButton: Locator
    private readonly strategyCard: Locator
    private readonly taxCard: Locator
    private clicks: string[]
    private readonly page: Page
    private session?: { user?: string, [k: string]: any }
    private dbService?: DatabaseService

    constructor(page: Page, clicks: string[] = [], session?: { user?: string, [k: string]: any }, dbService?: DatabaseService){
        // Inicializa la página, locators, estado de sesión y servicio de BD
        this.page = page
        this.clicks = clicks
        this.session = session
        this.dbService = dbService
        this.userTextBox = page.getByRole('textbox', { name: 'Enter your email, phone, or' })
        this.nextButton = page.getByRole('button', { name: 'Next' })
        this.passwordTextBox = page.getByRole('textbox', { name: 'Enter the password for' })
        this.signInButton = page.getByRole('button', { name: 'Sign in' })
        this.laFirmaDropdown = page.getByRole('link', { name: 'La Firma ' })
        this.quienesSomosButton = page.getByRole('link', { name: 'Quiénes somos' }).first()
        this.centroDeRecursosButton = page.getByRole('link', { name: /Centro de recursos/i }).first()
        this.talentoButton = page.getByRole('link', { name: /Talento/i }).first()
        this.comiteEjecutivoButton = page.getByRole('link', { name: 'Comité Ejecutivo ' })
        this.consejosSociosButton = page.getByRole('link', { name: 'Consejo de Socios' })
        this.negociosButton = page.getByRole('link', { name: 'Negocios' })
        this.strategyCard = page.locator('div:nth-child(2) > .intranetDTT-card > .intranetDTT-card-content')
        this.taxCard = page.locator('div:nth-child(3) > .intranetDTT-card > .intranetDTT-card-content')
    }

    // Extrae NEmpleado desde document.cookie (por ejemplo dentro de DTT_PerfilUsuario_INTRANET)
    async extractNEmpleadoFromCookies(): Promise<string> {
        // Lee document.cookie y extrae NEmpleado o patrones similares
        try {
            const cookieString = await this.page.evaluate(() => document.cookie || '')
            if (!cookieString) return ''
            const parts = cookieString.split('; ').map(p => {
                const idx = p.indexOf('=')
                return idx >= 0 ? [p.slice(0, idx).trim(), p.slice(idx + 1)] : [p.trim(), '']
            })

            for (const [, v] of parts) {
                if (!v) continue
                const inner = /NEmpleado=([^&;]+)/i.exec(v)
                if (inner && inner[1]) return decodeURIComponent(inner[1])
            }

            const found = parts.find(([k]) => /^(NEmpleado|N_Empleado|N-Empleado|numEmpleado|numeroEmpleado|employeeNumber|empleado|usuario)$/i.test(k))
            if (found && found[1]) return decodeURIComponent(found[1])

            const m = /([A-Z]?S?\d{6,10})/.exec(cookieString)
            if (m) return m[1]
        } catch (e) { /* ignore */ }
        return ''
    }

    private async getTrackingData(): Promise<object> {
        // Recoge datos de tracking básicos desde la página (id_sesion, title, url, etc.).
        // Si la evaluación falla por navegación, reintenta una vez.
        for (let attempt = 0; attempt < 2; attempt++) {
            try {
                return await this.page.evaluate(() => ({
                    id_sesion: (window as any).uuid ?? 'No disponible',
                    title: document.title,
                    referer: document.referrer || null,
                    url: window.location.href,
                    tiempo: new Date().toISOString(),
                    userAgent: navigator.userAgent,
                }))
            } catch (e) {
                if (attempt === 0) {
                    // pequeña espera antes de reintentar
                    await this.page.waitForTimeout(300)
                    continue
                }
                throw e
            }
        }
        return {}
}


    private async fillUsername(username: string){
        // Rellena el campo de usuario y pulsa el botón 'Next'
        await this.userTextBox.waitFor({ state: 'visible', timeout: 10000 })
        await this.userTextBox.fill(username)
        await this.nextButton.click();
    }

    private async fillPassword(password: string){
        // Rellena el campo de contraseña
        await this.passwordTextBox.fill(password)
    }

    private async clickSignInButton(){
        // Hace clic en 'Sign in' y espera (si procede) la navegación
        await Promise.all([
            this.signInButton.click(),
            // waitForNavigation may never happen (login could use XHR); swallow timeout
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null)
        ])
    }

    async doLogin(username: string, password: string){
        // Orquesta el proceso de login: usuario, contraseña y submit
        await this.fillUsername(username)
        await this.fillPassword(password)
        await this.clickSignInButton()  
    }

    static async abrirEnIncognito(browser: Browser) {
        // Crea y retorna un nuevo contexto/página (modo incógnito)
        const context = await browser.newContext();
        const page = await context.newPage();
        return { context, page };
    }

    async clickLaFirmaDropdown(){
        // Click en el dropdown 'La Firma' y registra evento de tracking + BD
        await this.laFirmaDropdown.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.laFirmaDropdown.click()
        ])
        // pequeño buffer para estabilidad antes de evaluar
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Dropdown La Firma'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickQuienesSomosButton(){
        // Click en 'Quiénes somos' y registra evento de tracking + BD
        await this.quienesSomosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.quienesSomosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Quienes somos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickCentroDeRecursosButton(){
        // Click en 'Centro de recursos' y registra evento de tracking + BD
        await this.centroDeRecursosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.centroDeRecursosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Centro de recursos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)                   
    }

    async clickTalentoButton(){
        // Click en 'Talento' y registra evento de tracking + BD
        // Si el enlace no es visible, intentar abrir el dropdown de "Centro de recursos" primero
        try {
            await this.talentoButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            // intentar abrir el dropdown y esperar de nuevo
            try {
                await this.centroDeRecursosButton.click()
            } catch (ee) { /* ignore click failure */ }
            await this.talentoButton.waitFor({ state: 'visible', timeout: 10000 })
        }

        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.talentoButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Talento'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)           
    }

    async clickComiteEjecutivoButton(){
        // Click en 'Comité Ejecutivo' y registra evento de tracking + BD
        await this.comiteEjecutivoButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.comiteEjecutivoButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Comite Ejecutivo'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickConsejosSociosButton(){
        // Click en 'Consejo de Socios' y registra evento de tracking + BD
        await this.consejosSociosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.consejosSociosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Consejo de Socios'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickNegociosButton(){    
    // Click en 'Negocios' y registra evento de tracking + BD
        await this.negociosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.negociosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Negocios'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickStrategyCard(){
        // Click en la tarjeta 'Strategy' y registra evento de tracking + BD
        await this.strategyCard.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([ 
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.strategyCard.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Click Strategy Card'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickTaxCard(){
        // Click en la tarjeta 'Tax' y registra evento de tracking + BD
        await this.taxCard.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([ 
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.taxCard.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Click Tax Card'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    private pushClickRecord(accion: string, tracking: any, dbRow?: any) {
        // Añade el registro de click (solo playwright). Si se pasa dbRow, incluye los datos de BD y el resultado del match.
        const entry: any = {
            accion,
            playwright: tracking,
            database: dbRow || {}
        }

        if (dbRow) {
            const match = {
                title: !!(dbRow && dbRow.title === tracking.title),
                referer: !!(dbRow && ((dbRow.referer || null) === (tracking.referer || null))),
                url: !!(dbRow && dbRow.url === tracking.url),
                numEmpleado: !!(dbRow && ((String(dbRow.numEmpleado || '') === String(tracking.numEmpleado || '')) || (typeof dbRow.datos === 'string' && /NEmpleado=([^&;]+)/i.exec(dbRow.datos)?.[1] === tracking.numEmpleado)))
            }
            const matchOk = Object.values(match).every(v => v)
            let matchMessage = ''
            if (!dbRow) {
                matchMessage = `[NO DB ROW] ${accion}: no se encontró registro en BBDD`
            } else if (matchOk) {
                matchMessage = `[MATCH OK] ${accion}: campos comparados son iguales`
            } else {
                matchMessage = `[MISMATCH] ${accion}: algunos campos no coinciden`
            }
            entry.match = match
            entry.matchOk = matchOk
            entry.matchMessage = matchMessage
        }

        this.clicks.push(entry as any)
    }
}





