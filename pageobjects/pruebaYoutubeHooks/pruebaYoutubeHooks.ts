import { Locator, Page, Browser } from "@playwright/test"

export class pruebaYoutubeHooks {

    private readonly acceptCookiesButton: Locator
    private readonly searchTextBox: Locator
    private readonly searchButton: Locator
    private readonly youtuberProfileLink: Locator
    private readonly videosPageButton: Locator
    private readonly videoButton: Locator
    private clicks: string[]
    private readonly page: Page

    constructor(page: Page, clicks: string[] = []) {
        this.page = page
        this.clicks = clicks
        this.acceptCookiesButton = page.getByRole('button', { name: 'Accept the use of cookies and' })
        this.searchTextBox = page.getByRole('combobox', { name: 'Search' })
        this.searchButton = page.getByRole('button', { name: 'Search', description: 'Search', exact: true })
        this.youtuberProfileLink = page.getByRole('link', { name: 'IlloJuan Verified @IlloJuan_•' })
        this.videosPageButton = page.locator('#tabsContent').getByText('Videos')
        this.videoButton = page.getByRole('link', { name: 'OPERACIÓN TEMAZO 4 🎤 ft.' })
    }

    private async getPageInfo(): Promise<string> {
    const referrer = await this.page.evaluate(() => document.referrer || 'Null')
    const title = await this.page.evaluate(() => document.title)
    return `${referrer.padEnd(50, ' ')} || ${title}`
}

async searchVideo(videoName: string) {
    await this.acceptCookiesButton.click()
    this.clicks.push(`${'Aceptar cookies'.padEnd(35, ' ')} || ${await this.getPageInfo()}`)

    await this.searchTextBox.click()
    await this.searchTextBox.fill(videoName)
    this.clicks.push(`${`Búsqueda: "${videoName}"`.padEnd(35, ' ')} || ${await this.getPageInfo()}`)

    await this.searchButton.click()
    this.clicks.push(`${'Botón buscar'.padEnd(35, ' ')} || ${await this.getPageInfo()}`)

    await this.youtuberProfileLink.click()
    this.clicks.push(`${'Perfil del youtuber'.padEnd(35, ' ')} || ${await this.getPageInfo()}`)

    await this.videosPageButton.click()
    this.clicks.push(`${'Pestaña Videos'.padEnd(35, ' ')} || ${await this.getPageInfo()}`)

    await this.videoButton.click()
    this.clicks.push(`${'Vídeo seleccionado'.padEnd(35, ' ')} || ${await this.getPageInfo()}`)
}

    static async abrirEnIncognito(browser: Browser) {
        const context = await browser.newContext()
        const page = await context.newPage()
        return { context, page }
    }
}