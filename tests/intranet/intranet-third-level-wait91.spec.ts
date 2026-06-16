import { test } from '@playwright/test'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo'
import { IntranetPage } from '../../pageobjects/intranet/IntranetPage'

// Aumentar timeout para permitir esperas largas (>= 91s)
test.setTimeout(180000)

// Test que replica el comportamiento del tercer nivel pero espera 91 segundos
// entre el segundo y el tercer click. No toca la base de datos ni modifica
// archivos existentes.

const RUNS = 1
for (let run = 1; run <= RUNS; run++) {
    test(`intranet third level - wait91 - run ${run}`, async ({ browser }) => {
        const { context, page } = await IntranetPage.abrirEnIncognito(browser)

        await test.step('Navigation to intranet page', async () => {
            const navigateTo = new NavigateTo(page)
            await navigateTo.intranetPage()
        })

        const username = 'vsimongarces@deloitte.es'
        const password = 'Pradillano180206'

        await test.step('Login to the intranet', async () => {
            const intranetPage = new IntranetPage(page)
            await intranetPage.doLogin(username, password)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on La Firma dropdown', async () => {
            const intranetPage = new IntranetPage(page)
            await intranetPage.clickLaFirmaDropdown()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Quienes somos button', async () => {
            const intranetPage = new IntranetPage(page)
            await intranetPage.clickQuienesSomosButton()
            await page.waitForTimeout(1000)
        })

        // Espera de 91 segundos entre segundo y tercer click
        await page.waitForTimeout(91000)

        await page.waitForTimeout(3000)
        await test.step('Click on Estructura y Gobierno button', async () => {
            const intranetPage = new IntranetPage(page)
            await intranetPage.clickComiteEjecutivoButton()
            await page.waitForTimeout(1000)
        })

        await page.waitForTimeout(3000)
        await test.step('Click on Consejo de Socios button', async () => {
            const intranetPage = new IntranetPage(page)
            await intranetPage.clickConsejosSociosButton()
            await page.waitForTimeout(1000)
        })

        // cerrar contexto para limpieza
        try { await context.close() } catch { /* ignore */ }
    })
}
