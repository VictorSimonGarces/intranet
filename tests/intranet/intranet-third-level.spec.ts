import { test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo'
import { IntranetPage } from '../../pageobjects/intranet/IntranetPage'
import { DatabaseService } from '../../services/DatabaseService'

let sessionSummary: {
    user: string,
    startTime: Date,
    clicks: any[],
    sessionId: string
} = { user: '', startTime: new Date(), clicks: [], sessionId: '' };

let dbService: DatabaseService | undefined

test.beforeEach(async () => {
    sessionSummary = {
        user: '',
        startTime: new Date(),
        clicks: [],
        sessionId: ''
    };
    // Inicializar conexión a la base de datos (config via env vars)
    try {
        const cfg = {
            server: process.env.DB_SERVER || 'ESAZUITS00057',
            database: process.env.DB_NAME || 'SesionEvento',
            user: process.env.DB_USER || 'ES\mallueaced',
            password: process.env.DB_PASSWORD || '',
            port: process.env.DB_PORT ? Number(process.env.DB_PORT) : undefined
        }
        dbService = new DatabaseService(cfg)
        await dbService.connect()
    } catch (e) {
        dbService = undefined
    }
});

test.afterEach(async ({}, testInfo) => {
    const duration = ((new Date().getTime() - sessionSummary.startTime.getTime()) / 1000).toFixed(2);

    // Asegurar user y sessionId predeterminados
    const finalUser = sessionSummary.user && sessionSummary.user !== '' ? sessionSummary.user : 'No disponible'
    const finalSessionId = sessionSummary.sessionId && sessionSummary.sessionId !== '' ? sessionSummary.sessionId : 'No disponible'

    // Actualizar los clicks para insertar el id_sesion real
    for (let i = 0; i < sessionSummary.clicks.length; i++) {
        const item: any = sessionSummary.clicks[i]
        if (!item) continue
        const detail = item.detail ?? item
        if (detail && detail.tracking && typeof detail.tracking === 'object') {
            detail.tracking.id_sesion = finalSessionId
            // opcional: también incluir numEmpleado en tracking si se desea
            detail.tracking.numEmpleado = finalUser
        } else if (item.detail?.tracking && typeof item.detail.tracking === 'object') {
            item.detail.tracking.id_sesion = finalSessionId
            item.detail.tracking.numEmpleado = finalUser
        } else {
            // fallback: reemplazo en la serialización
            try {
                const s = JSON.stringify(item)
                if (s.includes('No disponible')) {
                    sessionSummary.clicks[i] = JSON.parse(s.replace(/"No disponible"/g, `"${finalSessionId}"`))
                }
            } catch {}
        }
    }

    const summary = {
        test: testInfo.title,
        status: testInfo.status,
        user: finalUser,
        sessionId: finalSessionId,
        start: sessionSummary.startTime.toLocaleTimeString(),
        duration: `${duration}s`,
        clicks: sessionSummary.clicks.map((c, i) => ({
            index: i + 1,
            detail: c
        }))
    }

    const outputDir = path.join(__dirname, '../../reports')
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

    const reportsFile = path.join(outputDir, 'reports.json')
    try {
        let allReports: any[] = []
        if (fs.existsSync(reportsFile)) {
            try {
                const existing = fs.readFileSync(reportsFile, 'utf8')
                allReports = existing ? JSON.parse(existing) : []
                if (!Array.isArray(allReports)) allReports = []
            } catch (e) {
                allReports = []
            }
        }
        allReports.push(summary)
        fs.writeFileSync(reportsFile, JSON.stringify(allReports, null, 2))
        console.log(`Appended report to: reports.json`)
    } catch (e) {
        // Fallback: still try to write a single file to avoid silent loss
        const safeTitle = testInfo.title.replace(/[<>:"\/\\|?*\x00-\x1F]/g, '_').replace(/\s+/g, '_')
        const fileName = `${safeTitle}_${Date.now()}.json`
        fs.writeFileSync(path.join(outputDir, fileName), JSON.stringify(summary, null, 2))
        console.log(`Saved report (fallback): ${fileName}`)
    }
    // Cerrar conexión a BD si existe
    try {
        if (dbService) await dbService.disconnect()
    } catch (e) { /* ignore */ }
});

test('intranet first level "Quienes somos"', async ({ browser }) => {
    const { context, page } = await IntranetPage.abrirEnIncognito(browser)

    await test.step('Navigation to intranet page', async () => {
        const navigateTo = new NavigateTo(page)
        await navigateTo.intranetPage()
    })

    const username = 'vsimongarces@deloitte.es'
    const password = 'Pradillano180206'

    await test.step('Login to the intranet', async () => {
        const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
        const analyticsUrlBase = 'https://intranet_dev.es.deloitte.com/_layouts/15/PMS_CustomPages/IISHandler_analiticasdnet.ashx'
        const analyticsPromise = page.waitForRequest(r => r.url().startsWith(analyticsUrlBase) && r.method() === 'POST', { timeout: 20000 })
        await intranetPage.doLogin(username, password)
        try {
            const req = await analyticsPromise
            const post = req.postData() || ''
            let id = 'No disponible'
            let numEmpleado = ''
            try {
                const obj = JSON.parse(post)
                id = obj?.id_sesion ?? obj?.idSession ?? id
                numEmpleado = obj?.numEmpleado ?? obj?.num_empleado ?? obj?.employeeNumber ?? obj?.usuario ?? ''
            } catch {
                const params = new URLSearchParams(post)
                for (const [k, v] of params) {
                    if ((!id || id === 'No disponible') && /id[_-]?(sesion|session|s)/i.test(k) && v) id = v
                    if (!numEmpleado && /num(_|-)?emplead|employeeNumber|numEmpleado|usuario/i.test(k) && v) numEmpleado = v
                }
                if (!numEmpleado) {
                    const mEmp = /([A-Z]?S?\d{6,10})/.exec(post) // captura patrones tipo S90049840 o 90049840
                    if (mEmp) numEmpleado = mEmp[1]
                }
                if ((id === 'No disponible' || !id) && post) {
                    const mId = /id[_-]?sesi[oó]n[:=]"?([a-zA-Z0-9_\-]+)"?/i.exec(post) || /"id_sesion"\s*:\s*"([^"]+)"/i.exec(post)
                    if (mId) id = mId[1]
                }
            }
            sessionSummary.sessionId = String(id)
            // Guardar numEmpleado explícitamente como user (ej: S90049840)
            sessionSummary.user = numEmpleado && numEmpleado !== '' ? String(numEmpleado) : sessionSummary.user || ''
        } catch {
            sessionSummary.sessionId = 'No disponible'
            // conservar user actual o marcar no disponible
            sessionSummary.user = sessionSummary.user || 'No disponible'
        }

        // Extraer `NEmpleado` desde `document.cookie` (incluyendo valores dentro
        // de cookies como `DTT_PerfilUsuario_INTRANET=...&NEmpleado=S90049840`) y
        // priorizarlo como `user`.
        try {
            const cookieString = await page.evaluate(() => document.cookie || '')
            if (cookieString) {
                let nEmpleado = ''
                const parts = cookieString.split('; ').map(p => {
                    const idx = p.indexOf('=')
                    return idx >= 0 ? [p.slice(0, idx).trim(), p.slice(idx + 1)] : [p.trim(), '']
                })

                // Buscar dentro de los valores de cada cookie (por ejemplo DTT_PerfilUsuario_INTRANET)
                for (const [, v] of parts) {
                    if (!v) continue
                    const inner = /NEmpleado=([^&;]+)/i.exec(v)
                    if (inner && inner[1]) {
                        nEmpleado = decodeURIComponent(inner[1])
                        break
                    }
                }

                // Si no se encontró dentro de valores, buscar cookie con nombre que indique empleado
                if (!nEmpleado) {
                    const found = parts.find(([k]) => /^(NEmpleado|N_Empleado|N-Empleado|numEmpleado|numeroEmpleado|employeeNumber|empleado|usuario)$/i.test(k))
                    if (found && found[1]) nEmpleado = decodeURIComponent(found[1])
                }

                // Fallback: buscar patrón tipo S90049840 en toda la cookie string
                if (!nEmpleado) {
                    const m = /([A-Z]?S?\d{6,10})/.exec(cookieString)
                    if (m) nEmpleado = m[1]
                }

                if (nEmpleado) sessionSummary.user = nEmpleado
            }
        } catch (e) { /* ignore cookie parsing errors */ }
    })

    await page.waitForTimeout(3000)
    await test.step('Click on La Firma dropdown', async () => {
        const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
        await intranetPage.clickLaFirmaDropdown()
    })

    await page.waitForTimeout(3000)
    await test.step('Click on Quienes somos button', async () => {
        const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
        await intranetPage.clickQuienesSomosButton()
    })

    await page.waitForTimeout(3000)
    await test.step('Click on Estructura y Gobierno button', async () => {
        const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
        await intranetPage.clickComiteEjecutivoButton()
    })

    await page.waitForTimeout(3000)
    await test.step('Click on Consejo de Socios button', async () => {
        const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
        await intranetPage.clickConsejosSociosButton()
    })
})