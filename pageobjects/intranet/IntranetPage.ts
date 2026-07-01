import { Locator, Page, Browser } from "@playwright/test"
import { DatabaseService } from '../../services/DatabaseService'

export class IntranetPage {

    private readonly userTextBox: Locator
    private readonly nextButton: Locator
    private readonly passwordTextBox: Locator
    private readonly signInButton: Locator
    private readonly laFirmaDropdown: Locator
    private readonly laFirmaMenu: Locator
    private readonly quienesSomosButton: Locator
    private readonly centroDeRecursosButton: Locator
    private readonly talentoButton: Locator
    private readonly espacioDeLearningButton: Locator
    private readonly industriasButton: Locator
    private readonly geografiasButton: Locator
    private readonly areasCorporativasButton: Locator
    private readonly sociedadesButton: Locator
    private readonly presentacionesFirmaButton: Locator
    private readonly comiteEjecutivoButton: Locator
    private readonly deloitteTalentConnectButton: Locator
    private readonly programasMovilidadButton: Locator
    private readonly programaAlumniButton: Locator
    private readonly espacioPerformanceButton: Locator
    private readonly modelosTalentoButton: Locator
    private readonly modelosCompetenciasButton: Locator
    private readonly saludSeguridadBienestarButton: Locator
    private readonly wellbeingButton: Locator
    private readonly programaBeingFlexibleButton: Locator
    private readonly beneficiosRetribucionButton: Locator
    private readonly accionSocialButton: Locator
    private readonly programaDiversidadButton: Locator
    private readonly consejosSociosButton: Locator
    private readonly negociosButton: Locator
    private readonly estrategiaDeNegocioButton: Locator
    private readonly culturaButton: Locator
    private readonly riskReputationButton: Locator
    private readonly eticaButton: Locator
    private readonly strategyCard: Locator
    private readonly taxCard: Locator
    private readonly alianzasCard: Locator
    private readonly networkingCard: Locator
    private readonly startmeUpButton: Locator
    private readonly politicasYProcedimientosButton: Locator
    private readonly comunidadesButton: Locator
    private readonly verTodosLosAplicativosButton: Locator
    private readonly verTodoLosDashboardsButton: Locator
    private readonly verTodasLasNoticiasButton: Locator
    private clicks: string[]
    private readonly page: Page
    private session?: { user?: string, [k: string]: any }

    constructor(page: Page, clicks: string[] = [], session?: { user?: string, [k: string]: any }, dbService?: DatabaseService) {
        // Inicializa la página, locators, estado de sesión y servicio de BD
        this.page = page
        this.clicks = clicks
        this.session = session
        this.userTextBox = page.getByRole('textbox', { name: 'Enter your email, phone, or' })
        this.nextButton = page.getByRole('button', { name: 'Next' })
        this.passwordTextBox = page.getByRole('textbox', { name: 'Enter the password for' })
        this.signInButton = page.getByRole('button', { name: 'Sign in' })
        this.laFirmaDropdown = page.getByRole('link', { name: 'La Firma ' })
        this.laFirmaMenu = page.locator('#menu-intranet-top-1')
        this.quienesSomosButton = this.page.getByRole('link', { name: 'Quiénes somos' });
        this.centroDeRecursosButton = page.locator('a:has-text("Centro de recursos"):visible').first()
        this.talentoButton = this.laFirmaMenu.getByRole('link', { name: /Talento/i }).first()
        this.espacioDeLearningButton = page.getByRole('link', { name: 'Espacio de Learning ' }).first()
        this.industriasButton = page.getByRole('link', { name: 'Industrias ' }).first()
        this.geografiasButton = page.getByRole('link', { name: 'Geografías ' }).first()
        this.areasCorporativasButton = page.getByRole('link', { name: 'Áreas corporativas y' }).first()
        this.sociedadesButton = page.getByRole('link', { name: 'Sociedades ' }).first()
        this.comiteEjecutivoButton = page.locator('a:has-text("Comité Ejecutivo"):visible').first()
        this.presentacionesFirmaButton = page.getByRole('link', { name: 'Presentaciones de Firma ' }).first()
        this.deloitteTalentConnectButton = page.getByRole('link', { name: 'Deloitte Talent Connect ' }).first()
        this.programasMovilidadButton = page.getByRole('link', { name: 'Programas de Movilidad ' }).first()
        this.programaAlumniButton = page.getByRole('link', { name: 'Programa Alumni ' }).first()
        this.espacioPerformanceButton = page.getByRole('link', { name: 'Espacio de Performance ' }).first()
        this.modelosTalentoButton = page.getByRole('link', { name: 'Modelos de Talento ' }).first()
        this.modelosCompetenciasButton = page.getByRole('link', { name: 'Modelos de Competencias ' }).first()
        this.saludSeguridadBienestarButton = page.getByRole('link', { name: 'Salud, Seguridad y Bienestar ' }).first()
        this.wellbeingButton = page.getByRole('link', { name: 'Wellbeing at Deloitte ' }).first()
        this.programaBeingFlexibleButton = page.getByRole('link', { name: 'Programa Being Flexible ' }).first()
        this.beneficiosRetribucionButton = page.getByRole('link', { name: 'Beneficios y Retribución' }).first()
        this.accionSocialButton = page.getByRole('link', { name: 'Acción Social ' }).first()
        this.programaDiversidadButton = page.getByRole('link', { name: 'Programa Diversidad, Equidad' }).first()
        this.consejosSociosButton = this.page.getByRole('link', { name: 'Consejo de Socios' })
        this.negociosButton = page.locator('a:has-text("Negocios"):visible').first()
        this.estrategiaDeNegocioButton = this.page.getByRole('link', { name: 'Estrategia de Negocio' })
        this.culturaButton = this.page.getByRole('link', { name: 'Cultura' })
        this.riskReputationButton = this.page.getByRole('link', { name: 'Risk & Reputation' })
        this.eticaButton = this.page.getByRole('link', { name: 'Ética' })
        this.strategyCard = page.locator('div:nth-child(2) > .intranetDTT-card > .intranetDTT-card-content')
        this.taxCard = page.locator('div:nth-child(3) > .intranetDTT-card > .intranetDTT-card-content')
        // Usar selectores basados en href/texto visibles para evitar duplicados/ocultos
        this.alianzasCard = page.locator('a[href*="alianzas"]:visible').first()
        this.networkingCard = page.locator('a[href*="networking"]:visible').first()
        this.startmeUpButton = page.getByRole('link', { name: 'StartmeUP ' })
        this.politicasYProcedimientosButton = page.getByRole('link', { name: 'Políticas y Procedimientos' })
        this.comunidadesButton = page.getByRole('link', { name: 'Comunidades' })
        this.verTodosLosAplicativosButton = page.getByRole('link', { name: 'Ver todos los Aplicativos ' })
        this.verTodoLosDashboardsButton = page.getByRole('link', { name: 'Ver todos los Dashboards &' })
        this.verTodasLasNoticiasButton = page.getByRole('link', { name: 'Ver todas las noticias ' })
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


    private async fillUsername(username: string) {
        // Rellena el campo de usuario y pulsa el botón 'Next'
        await this.userTextBox.waitFor({ state: 'visible', timeout: 10000 })
        await this.userTextBox.fill(username)
        await this.nextButton.click();
    }

    private async fillPassword(password: string) {
        // Rellena el campo de contraseña
        await this.passwordTextBox.fill(password)
    }

    private async clickSignInButton() {
        // Hace clic en 'Sign in' y espera (si procede) la navegación
        await Promise.all([
            this.signInButton.click(),
            // waitForNavigation may never happen (login could use XHR); swallow timeout
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null)
        ])
    }

    async doLogin(username: string, password: string) {
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


    static async abrirNormal(browser: Browser) {
        // Abre una nueva pestaña en el contexto por defecto (NO incógnito)
        const page = await browser.newPage();
        return page;
    }

    async clickLaFirmaDropdown() {
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

    async clickIndustriasButton() {
        // Click en 'Industrias' y registra evento de tracking + BD
        try {
            await this.industriasButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            await this.industriasButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.industriasButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingInd: any = await this.getTrackingData()
        const accionInd = 'Boton Industrias'
        const nInd = await this.extractNEmpleadoFromCookies()
        if (nInd && this.session) this.session.user = nInd
        if (this.session) trackingInd.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionInd, trackingInd)
    }

    async clickGeografiasButton() {
        // Click en 'Geografías' y registra evento de tracking + BD
        try {
            await this.geografiasButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            await this.geografiasButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.geografiasButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingGeo: any = await this.getTrackingData()
        const accionGeo = 'Boton Geografias'
        const nGeo = await this.extractNEmpleadoFromCookies()
        if (nGeo && this.session) this.session.user = nGeo
        if (this.session) trackingGeo.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionGeo, trackingGeo)
    }

    async clickAreasCorporativasButton() {
        // Click en 'Áreas corporativas y' y registra evento de tracking + BD
        try {
            await this.areasCorporativasButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            await this.areasCorporativasButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.areasCorporativasButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingAC: any = await this.getTrackingData()
        const accionAC = 'Boton Areas Corporativas'
        const nAC = await this.extractNEmpleadoFromCookies()
        if (nAC && this.session) this.session.user = nAC
        if (this.session) trackingAC.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionAC, trackingAC)
    }

    async clickSociedadesButton() {
        // Click en 'Sociedades' y registra evento de tracking + BD
        try {
            await this.sociedadesButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            await this.sociedadesButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.sociedadesButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingSoc: any = await this.getTrackingData()
        const accionSoc = 'Boton Sociedades'
        const nSoc = await this.extractNEmpleadoFromCookies()
        if (nSoc && this.session) this.session.user = nSoc
        if (this.session) trackingSoc.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionSoc, trackingSoc)
    }

    async clickPresentacionesFirmaButton() {
        // Click en 'Presentaciones de Firma' y registra evento de tracking + BD
        try {
            await this.presentacionesFirmaButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            await this.presentacionesFirmaButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.presentacionesFirmaButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingPF: any = await this.getTrackingData()
        const accionPF = 'Boton Presentaciones de Firma'
        const nPF = await this.extractNEmpleadoFromCookies()
        if (nPF && this.session) this.session.user = nPF
        if (this.session) trackingPF.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionPF, trackingPF)
    }

    async clickDeloitteTalentConnectButton() {
        // Click en 'Deloitte Talent Connect' y registra evento de tracking + BD
        try {
            await this.deloitteTalentConnectButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.deloitteTalentConnectButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.deloitteTalentConnectButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingDTC: any = await this.getTrackingData()
        const accionDTC = 'Boton Deloitte Talent Connect'
        const nDTC = await this.extractNEmpleadoFromCookies()
        if (nDTC && this.session) this.session.user = nDTC
        if (this.session) trackingDTC.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionDTC, trackingDTC)
    }

    async clickProgramasMovilidadButton() {
        // Click en 'Programas de Movilidad' y registra evento de tracking + BD
        try {
            await this.programasMovilidadButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.programasMovilidadButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.programasMovilidadButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingPM: any = await this.getTrackingData()
        const accionPM = 'Boton Programas de Movilidad'
        const nPM = await this.extractNEmpleadoFromCookies()
        if (nPM && this.session) this.session.user = nPM
        if (this.session) trackingPM.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionPM, trackingPM)
    }

    async clickProgramaAlumniButton() {
        // Click en 'Programa Alumni' y registra evento de tracking + BD
        try {
            await this.programaAlumniButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.programaAlumniButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.programaAlumniButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingPA: any = await this.getTrackingData()
        const accionPA = 'Boton Programa Alumni'
        const nPA = await this.extractNEmpleadoFromCookies()
        if (nPA && this.session) this.session.user = nPA
        if (this.session) trackingPA.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionPA, trackingPA)
    }

    async clickEspacioPerformanceButton() {
        // Click en 'Espacio de Performance' y registra evento de tracking + BD
        try {
            await this.espacioPerformanceButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.espacioPerformanceButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.espacioPerformanceButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingEP: any = await this.getTrackingData()
        const accionEP = 'Boton Espacio de Performance'
        const nEP = await this.extractNEmpleadoFromCookies()
        if (nEP && this.session) this.session.user = nEP
        if (this.session) trackingEP.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionEP, trackingEP)
    }

    async clickModelosTalentoButton() {
        // Click en 'Modelos de Talento' y registra evento de tracking + BD
        try {
            await this.modelosTalentoButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.modelosTalentoButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.modelosTalentoButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingMT: any = await this.getTrackingData()
        const accionMT = 'Boton Modelos de Talento'
        const nMT = await this.extractNEmpleadoFromCookies()
        if (nMT && this.session) this.session.user = nMT
        if (this.session) trackingMT.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionMT, trackingMT)
    }

    async clickModelosCompetenciasButton() {
        // Click en 'Modelos de Competencias' y registra evento de tracking + BD
        try {
            await this.modelosCompetenciasButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { /* ignore */ }
            await this.modelosCompetenciasButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.modelosCompetenciasButton.click()
        ])
        await this.page.waitForTimeout(200)
        const trackingMC: any = await this.getTrackingData()
        const accionMC = 'Boton Modelos de Competencias'
        const nMC = await this.extractNEmpleadoFromCookies()
        if (nMC && this.session) this.session.user = nMC
        if (this.session) trackingMC.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accionMC, trackingMC)
    }

    async clickSaludSeguridadBienestarButton() {
        try {
            await this.saludSeguridadBienestarButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.saludSeguridadBienestarButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.saludSeguridadBienestarButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Salud Seguridad Bienestar'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickWellbeingButton() {
        try {
            await this.wellbeingButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.wellbeingButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.wellbeingButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Wellbeing at Deloitte'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickProgramaBeingFlexibleButton() {
        try {
            await this.programaBeingFlexibleButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.programaBeingFlexibleButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.programaBeingFlexibleButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Programa Being Flexible'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickBeneficiosRetribucionButton() {
        try {
            await this.beneficiosRetribucionButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.beneficiosRetribucionButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.beneficiosRetribucionButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Beneficios y Retribucion'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickAccionSocialButton() {
        try {
            await this.accionSocialButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.accionSocialButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.accionSocialButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Acción Social'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickProgramaDiversidadButton() {
        try {
            await this.programaDiversidadButton.waitFor({ state: 'visible', timeout: 10000 })
        } catch (e) {
            try { await this.talentoButton.click() } catch (_) { }
            await this.programaDiversidadButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.programaDiversidadButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Programa Diversidad'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickQuienesSomosButton() {
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

    async clickCentroDeRecursosButton() {
        // Click en 'Centro de recursos' y registra evento de tracking + BD
        try {
            await this.centroDeRecursosButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            await this.laFirmaDropdown.waitFor({ state: 'visible', timeout: 10000 })
            await Promise.all([
                this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
                this.laFirmaDropdown.click()
            ])
            await this.laFirmaMenu.waitFor({ state: 'visible', timeout: 10000 })
            await this.centroDeRecursosButton.waitFor({ state: 'visible', timeout: 10000 })
        }

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

    async clickTalentoButton() {
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

    async clickEspacioDeLearningButton() {
        // Click en 'Espacio de Learning' y registra evento de tracking + BD
        await this.espacioDeLearningButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.espacioDeLearningButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Espacio de Learning'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        this.pushClickRecord(accion, tracking)
    }

    async clickComiteEjecutivoButton() {
        // Click en 'Comité Ejecutivo' y registra evento de tracking + BD
        try {
            await this.comiteEjecutivoButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            try {
                await this.laFirmaDropdown.waitFor({ state: 'visible', timeout: 10000 })
                await this.laFirmaDropdown.click().catch(() => null)
            } catch (_) { /* ignore */ }
            await this.laFirmaMenu.waitFor({ state: 'visible', timeout: 10000 })
            await this.comiteEjecutivoButton.waitFor({ state: 'visible', timeout: 10000 })
        }
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

    async clickConsejosSociosButton() {
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

    async clickNegociosButton() {
        // Click en 'Negocios' y registra evento de tracking + BD
        try {
            await this.negociosButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            try {
                await this.laFirmaDropdown.waitFor({ state: 'visible', timeout: 10000 })
                await this.laFirmaDropdown.click().catch(() => null)
            } catch (_) { /* ignore */ }
            await this.laFirmaMenu.waitFor({ state: 'visible', timeout: 10000 })
            await this.negociosButton.waitFor({ state: 'visible', timeout: 10000 })
        }
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

    async clickEstrategiaDeNegocioButton() {
        // Click en 'Estrategia de Negocio' y registra evento de tracking + BD
        try {
            await this.estrategiaDeNegocioButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            await this.laFirmaDropdown.click().catch(() => null)
            await this.laFirmaMenu.waitFor({ state: 'visible', timeout: 10000 })
            await this.estrategiaDeNegocioButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.estrategiaDeNegocioButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Estrategia de Negocio'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickCulturaButton() {
        // Click en 'Cultura' y registra evento de tracking + BD
        try {
            await this.culturaButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            await this.laFirmaDropdown.click().catch(() => null)
            await this.culturaButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.culturaButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Cultura'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickRiskReputationButton() {
        // Click en 'Risk & Reputation' y registra evento de tracking + BD
        try {
            await this.riskReputationButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            await this.laFirmaDropdown.click().catch(() => null)
            await this.riskReputationButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.riskReputationButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Risk & Reputation'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickEticaButton() {
        // Click en 'Ética' y registra evento de tracking + BD
        try {
            await this.eticaButton.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            await this.laFirmaDropdown.click().catch(() => null)
            await this.eticaButton.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.eticaButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Ética'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickStrategyCard() {
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

    async clickTaxCard() {
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

    async clickAlianzasCard() {
        // Click en la tarjeta 'Alianzas' y registra evento de tracking + BD
        // Intentar una espera corta y, si no está visible, abrir el menú padre como fallback
        try {
            await this.alianzasCard.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            try {
                // Preferir abrir el menú 'Centro de recursos' que expone la tarjeta
                await this.clickCentroDeRecursosButton()
            } catch (_) {
                try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            }
            await this.alianzasCard.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.alianzasCard.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Click Alianzas Card'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickPoliticasYProcedimientosButton() {
        // Click en 'Políticas y Procedimientos' y registra evento de tracking + BD
        await this.politicasYProcedimientosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.politicasYProcedimientosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Politicas y Procedimientos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickNetworkingCard() {
        // Click en la tarjeta 'Networking' y registra evento de tracking + BD
        try {
            await this.networkingCard.waitFor({ state: 'visible', timeout: 3000 })
        } catch (e) {
            try {
                await this.clickCentroDeRecursosButton()
            } catch (_) {
                try { await this.laFirmaDropdown.click() } catch (_) { /* ignore */ }
            }
            await this.networkingCard.waitFor({ state: 'visible', timeout: 10000 })
        }
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.networkingCard.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Click Networking Card'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickComunidadesButton() {
        // Click en 'Comunidades' y registra evento de tracking + BD
        await this.comunidadesButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.comunidadesButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Comunidades'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickStartmeUpButton() {
        // Click en el botón 'StartmeUP' y registra evento de tracking + BD
        await this.startmeUpButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.startmeUpButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Click StartmeUP Button'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickVerTodosLosAplicativosButton() {
        // Click en 'Ver todos los Aplicativos' y registra evento de tracking + BD
        await this.verTodosLosAplicativosButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.verTodosLosAplicativosButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Ver todos los Aplicativos'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickVerTodoLosDashboardsButton() {
        // Click en 'Ver todos los Dashboards' y registra evento de tracking + BD
        await this.verTodoLosDashboardsButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.verTodoLosDashboardsButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Ver todos los Dashboards'
        const n = await this.extractNEmpleadoFromCookies()
        if (n && this.session) this.session.user = n
        if (this.session) tracking.numEmpleado = this.session.user ?? ''
        // No consultar BD aquí; almacenar solo los datos de tracking para comprobación al final del test
        this.pushClickRecord(accion, tracking)
    }

    async clickVerTodasLasNoticiasButton() {
        // Click en 'Ver todas las noticias' y registra evento de tracking + BD
        await this.verTodasLasNoticiasButton.waitFor({ state: 'visible', timeout: 10000 })
        await Promise.all([
            this.page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 5000 }).catch(() => null),
            this.verTodasLasNoticiasButton.click()
        ])
        await this.page.waitForTimeout(200)
        const tracking: any = await this.getTrackingData()
        const accion = 'Boton Ver todas las noticias'
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





