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
    private clicks: string[]
    private readonly page: Page
    private session?: { user?: string, [k: string]: any }
    private dbService?: DatabaseService

    constructor(page: Page, clicks: string[] = [], session?: { user?: string, [k: string]: any }, dbService?: DatabaseService){
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
        this.centroDeRecursosButton = page.getByRole('link', { name: 'Centro de recursos ' }).first()
        this.talentoButton = page.getByRole('link', { name: 'Talento' }).first()
        this.comiteEjecutivoButton = page.getByRole('link', { name: 'Comité Ejecutivo ' })
        this.consejosSociosButton = page.getByRole('link', { name: 'Consejo de Socios' })
    }

    // Extrae NEmpleado desde document.cookie (por ejemplo dentro de DTT_PerfilUsuario_INTRANET)
    async extractNEmpleadoFromCookies(): Promise<string> {
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
    return await this.page.evaluate(() => ({
        id_sesion: (window as any).uuid ?? 'No disponible',
        title: document.title,
        referer: document.referrer || null,
        url: window.location.href,
        tiempo: new Date().toISOString(),
        userAgent: navigator.userAgent,
    }))
}

    private async getPageInfo(): Promise<string> {
        const referrer = await this.page.evaluate(() => document.referrer || 'Acceso directo')
        const title = await this.page.evaluate(() => document.title)
        const sessionId = await this.page.evaluate(() => {
            // Evitar JSON.stringify de window (circular). Iterar claves y manejar errores.
            try {
                const keys = Object.keys(window as any)
                for (const k of keys) {
                    try {
                        const v = (window as any)[k]
                        if (v && typeof v === 'object' && 'id_sesion' in v) return String((v as any).id_sesion)
                        // intentar convertir valores simples
                        if (typeof v === 'string' && v.includes('id_sesion')) {
                            const m = /id_sesion[:=]\s*["']?([^"'\s,}]+)["']?/.exec(v)
                            if (m) return m[1]
                        }
                    } catch (e) {
                        // ignorar propiedades que lanzan por circularidad
                    }
                }
            } catch (e) { /* fallback */ }
            return 'No disponible'
        })
        return `${referrer.padEnd(50, ' ')} || ${title.padEnd(40, ' ')} || ${sessionId}`
    }

    private async fillUsername(username: string){
        await this.userTextBox.waitFor({ state: 'visible', timeout: 10000 })
        await this.userTextBox.fill(username)
        await this.nextButton.click();
    }

    private async fillPassword(password: string){
        await this.passwordTextBox.fill(password)
    }

    private async clickSignInButton(){
        await Promise.all([
            this.signInButton.click(),
            // waitForNavigation may never happen (login could use XHR); swallow timeout
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null)
        ])
    }

    async doLogin(username: string, password: string){
        await this.fillUsername(username)
        await this.fillPassword(password)
        await this.clickSignInButton()  
    }

    static async abrirEnIncognito(browser: Browser) {
        const context = await browser.newContext();
        const page = await context.newPage();
        return { context, page };
    }

    async clickLaFirmaDropdown(){
        await this.laFirmaDropdown.waitFor({ state: 'visible', timeout: 10000 })
        await this.laFirmaDropdown.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Dropdown La Firma'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)
    }

    async clickQuienesSomosButton(){
        await this.quienesSomosButton.waitFor({ state: 'visible', timeout: 10000 })
        await this.quienesSomosButton.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Quienes somos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)
    }

    async clickCentroDeRecursosButton(){
        await this.centroDeRecursosButton.waitFor({ state: 'visible', timeout: 10000 })
        await this.centroDeRecursosButton.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Centro de recursos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)                   
    }

    async clickTalentoButton(){
        await this.talentoButton.waitFor({ state: 'visible', timeout: 10000 })
        await this.talentoButton.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Talento'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)           
    }

    async clickComiteEjecutivoButton(){
        await this.comiteEjecutivoButton.waitFor({ state: 'visible', timeout: 10000 })
        await this.comiteEjecutivoButton.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Comite Ejecutivo'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)
    }

    async clickConsejosSociosButton(){
        await this.consejosSociosButton.waitFor({ state: 'visible', timeout: 10000 })
        await this.consejosSociosButton.click()
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Consejo de Socios'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        let dbRow = null
        if (this.dbService) dbRow = await this.dbService.query(tracking.title, tracking.tiempo)
        this.pushClickRecord(accion, tracking, dbRow)
    }

    private pushClickRecord(accion: string, tracking: any, dbRow: any) {
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

        this.clicks.push({
            accion,
            playwright: tracking,
            database: dbRow || {},
            match,
            matchOk,
            matchMessage
        } as any)
    }

    async getSessionId(): Promise<string> {
        return await this.page.evaluate(() => {
            try {
                // Comprobar variables globales conocidas
                if ((window as any).id_sesion) return String((window as any).id_sesion);
                if ((window as any).sessionId) return String((window as any).sessionId);
                // LocalStorage
                const ls = localStorage.getItem('sessionId') || localStorage.getItem('id_sesion');
                if (ls) return ls;
                // Cookies
                const cookie = document.cookie.split('; ').find(c => c.trim().startsWith('sessionId='))?.split('=')[1];
                if (cookie) return cookie;
            } catch (e) { /* ignore */ }
            return 'No disponible';
        });
    }

    async getSessionIdFromAnalytics(timeout = 5000): Promise<string> {
        const analyticsUrl = 'https://intranet_dev.es.deloitte.com/_layouts/15/PMS_CustomPages/IISHandler_analiticasdnet.ashx'
        try {
            const req = await this.page.waitForRequest(r => r.url().startsWith(analyticsUrl) && r.method() === 'POST', { timeout })
            const post = req.postData() || ''
            // intentar JSON
            try {
                const obj = JSON.parse(post)
                if (obj?.id_sesion) return String(obj.id_sesion)
                if (obj?.idSession) return String(obj.idSession)
            } catch {}
            // intentar urlencoded
            try {
                const params = new URLSearchParams(post)
                for (const [k, v] of params) {
                    if (/id[_-]?(sesion|session|s)/i.test(k) && v) return v
                }
            } catch {}
            // fallback regex
            const m = /id[_-]?sesi[oó]n[:=]"?([a-zA-Z0-9_\-]+)"?/i.exec(post) || /"id_sesion"\s*:\s*"([^"]+)"/i.exec(post)
            if (m) return m[1]
        } catch (e) {
            // no llegó la petición dentro del timeout
        }
        return 'No disponible'
    }
}





