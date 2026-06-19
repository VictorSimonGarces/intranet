import { test } from '@playwright/test'
test.describe.configure({ mode: 'parallel' });
import * as fs from 'fs'
import * as path from 'path'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo'
import { IntranetPage } from '../../pageobjects/intranet/IntranetPage'
import { DatabaseService } from '../../services/DatabaseService'
require('dotenv').config()
test.setTimeout(120000)

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
        const config = {
        server: 'ESAZUITS00057',
        database: 'EstadisticasIntranet',
        user: process.env.DB_USER || '',
        password: process.env.DB_PASSWORD || '',
        options: {
            trustedConnection: true,
            trustServerCertificate: true,
            encrypt: false,
            instanceName: ''  // déjalo vacío o pon el nombre de la instancia si la hay
        },  
        driver: 'msnodesqlv8',
    connectionString: 'Driver={ODBC Driver 17 for SQL Server};Server=ESAZUITS00057;Database=EstadisticasIntranet;Trusted_Connection=yes;'
}
        dbService = new DatabaseService(config)
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

    // Si hay servicio de BD, intentar enriquecer cada click consultando la BBDD
    // Esperar 2 segundos tras finalizar el test antes de realizar las comprobaciones con la BBDD
    await new Promise(res => setTimeout(res, 2000))

    if (dbService && sessionSummary.clicks.length > 0) {
        const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))
        for (let i = 0; i < sessionSummary.clicks.length; i++) {
            const item: any = sessionSummary.clicks[i]
            if (!item) continue
            const detail = item.detail ?? item
            if (!detail || !detail.tracking || typeof detail.tracking !== 'object') continue
            const tracking = detail.tracking

            let dbRow: any = null
            const maxAttempts = 10
            const intervalMs = 1000
            for (let attempt = 0; attempt < maxAttempts; attempt++) {
                try {
                        // Buscar en la BBDD por título (la fila más reciente)
                        dbRow = await dbService.query(tracking.title, tracking.tiempo)
                } catch (e) {
                    dbRow = null
                }
                if (dbRow) break
                await sleep(intervalMs)
            }

            const match = {
                title: !!(dbRow && dbRow.title === tracking.title),
                referer: !!(dbRow && ((dbRow.referer || null) === (tracking.referer || null))),
                url: !!(dbRow && dbRow.url === tracking.url),
                numEmpleado: !!(dbRow && ((String(dbRow.nameplate || '') === String(tracking.numEmpleado || '')) || (typeof dbRow.datos === 'string' && /NEmpleado=([^&;]+)/i.exec(dbRow.datos)?.[1] === tracking.numEmpleado)))
            }

            // Imprimir en consola los datos Playwright y la fila de BD para inspección
            try {
                console.log(`\n[CLICK ${i + 1}] ${detail.accion}`)
                console.log('[PLAYWRIGHT]', JSON.stringify(tracking, null, 2))
                console.log('[DB ROW]', dbRow ? JSON.stringify(dbRow, null, 2) : '<no row>')
            } catch (e) {
                console.log('[REPORT] Error serializing click/db data')
            }

            // Comparación impresa por consola: campos que no coinciden
            try {
                const failed = Object.entries(match).filter(([k, v]) => !v).map(([k]) => k)
                if (!dbRow) {
                    console.log(`[MISMATCH] ${detail.accion}: no se encontró registro en BBDD`)
                } else if (failed.length === 0) {
                    console.log(`[MATCH OK] ${detail.accion}: todos los campos coinciden`)
                } else {
                    console.log(`[MISMATCH] ${detail.accion}: campos fallidos -> ${failed.join(', ')}`)
                }
            } catch (e) {
                console.log('[REPORT] Error creando resumen de comparación')
            }

            const matchOk = Object.values(match).every(v => v)
            let matchMessage = ''
            if (!dbRow) {
                matchMessage = `[NO DB ROW] ${detail.accion}: no se encontró registro en BBDD`
            } else if (matchOk) {
                matchMessage = `[MATCH OK] ${detail.accion}: campos comparados son iguales`
            } else {
                matchMessage = `[MISMATCH] ${detail.accion}: algunos campos no coinciden`
            }

            detail.database = dbRow || {}
            detail.match = match
            detail.matchOk = matchOk
            detail.matchMessage = matchMessage
            // el objeto detail ya está en sessionSummary.clicks, así que queda actualizado
        }
    }

    // --- Resumen en terminal sobre coincidencias/mismatches ---
    try {
        const clicksForCheck: any[] = sessionSummary.clicks || []
        const mismatches: any[] = []
        for (let i = 0; i < clicksForCheck.length; i++) {
            const item: any = clicksForCheck[i]
            if (!item) continue
            const detail = item.detail ?? item
            const matchObj = detail.match ?? item.match ?? null
            const accion = detail.accion || item.accion || `Click#${i + 1}`
            const matchOk = detail.matchOk ?? item.matchOk
            if (matchObj && typeof matchObj === 'object') {
                const failedFields = Object.keys(matchObj).filter(f => !matchObj[f])
                if (failedFields.length > 0 || matchOk === false) {
                    mismatches.push({ index: i + 1, accion, failedFields, matchMessage: detail.matchMessage ?? item.matchMessage ?? '' })
                }
            } else if (matchOk === false) {
                mismatches.push({ index: i + 1, accion, failedFields: ['unknown'], matchMessage: detail.matchMessage ?? item.matchMessage ?? '' })
            }
        }

        if (mismatches.length === 0) {
            console.log(`[MATCH OK] Todos los campos coinciden para ${clicksForCheck.length} click(s).`)
        } else {
            console.log(`[MISMATCH] Se encontraron ${mismatches.length} click(s) con discrepancias:`)
            for (const mm of mismatches) {
                console.log(` - Click ${mm.index} - ${mm.accion}: campos fallidos -> ${mm.failedFields.join(', ')} ${mm.matchMessage ? `| ${mm.matchMessage}` : ''}`)
            }
        }
    } catch (e) {
        console.error('[REPORT] Error generando resumen de coincidencias:', (e as Error).message)
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

const RUNS = 1
for (let run = 1; run <= RUNS; run++) {
    test(`intranet create page_Clicks - run ${run}`, async ({ browser }) => {
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
            // Esperar la solicitud POST de analíticas para capturar id_sesion y numEmpleado
            const analyticsPromise = page.waitForRequest(r => r.url().startsWith(analyticsUrlBase) && r.method() === 'POST', { timeout: 20000 })
            await intranetPage.doLogin(username, password)
            try {
                const req = await analyticsPromise
                const post = req.postData() || ''
                let id = ''
                let numEmpleado = ''
                try {
                    const obj = JSON.parse(post)
                    id = obj?.id_sesion ?? obj?.idSession ?? id
                    numEmpleado = obj?.numEmpleado ?? obj?.num_empleado ?? obj?.employeeNumber ?? obj?.usuario ?? ''
                } catch {
                    const params = new URLSearchParams(String(post || ''))
                    for (const [k, v] of params.entries()) {
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
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Quienes somos button', async () => {
            const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
            await intranetPage.clickQuienesSomosButton()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Estructura y Gobierno button', async () => {
            const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
            await intranetPage.clickComiteEjecutivoButton()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Negocios button', async () => {
            const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
            await intranetPage.clickNegociosButton()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Strategy Card', async () => {
            const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
            await intranetPage.clickStrategyCard()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Tax Card', async () => {
            const intranetPage = new IntranetPage(page, sessionSummary.clicks, sessionSummary, dbService)
            await intranetPage.clickTaxCard()
            await page.waitForTimeout(1000)
        })

    })
}