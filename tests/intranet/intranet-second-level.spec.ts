import { test } from '@playwright/test'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo'
import { IntranetPage } from '../../pageobjects/intranet/IntranetPage'

test('intranet first level "Quienes somos"', async ({ browser }) => {
    // Crea un nuevo contexto de navegador ("incognito") y obtiene la página nueva resultante
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

    await test.step('Click on La Firma dropdown', async () => {
        const intranetPage = new IntranetPage(page)
        await intranetPage.clickLaFirmaDropdown()
    })

    await test.step('Click on Quienes somos button', async () => {
        const intranetPage = new IntranetPage(page)
        await intranetPage.clickQuienesSomosButton()
    })

    // await context.close()
}) 

test('intranet first level "Talento"', async ({ browser }) => {
    // Crea un nuevo contexto de navegador ("incognito") y obtiene la página nueva resultante
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

    await test.step('Click on La Firma dropdown', async () => {
        const intranetPage = new IntranetPage(page)
        await intranetPage.clickLaFirmaDropdown()
    })

    await test.step('Click on Talento button', async () => {
        const intranetPage = new IntranetPage(page)
        await intranetPage.clickTalentoButton()
    })

    // await context.close()
}) 