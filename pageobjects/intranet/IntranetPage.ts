import { Locator, Page, Browser } from "@playwright/test"

export class IntranetPage{

    private readonly userTextBox: Locator
    private readonly nextButton: Locator
    private readonly passwordTextBox: Locator
    private readonly signInButton: Locator
    private readonly laFirmaDropdown: Locator
    private readonly quienesSomosButton: Locator
    private readonly centroDeRecursosButton: Locator
    private readonly talentoButton: Locator
    private readonly estructuraYGobiernoButton: Locator

    constructor(page: Page){
        this.userTextBox = page.getByRole('textbox', { name: 'Enter your email, phone, or' })
        this.nextButton = page.getByRole('button', { name: 'Next' })
        this.passwordTextBox = page.getByRole('textbox', { name: 'Enter the password for' })
        this.signInButton = page.getByRole('button', { name: 'Sign in' })
        this.laFirmaDropdown = page.locator('//*[@id="menu-intranet-top-1"]/a')
        this.quienesSomosButton = page.locator('/html/body/form/div[4]/div[1]/main/div[2]/div/div/div/div[1]/div/span/div[3]/div/div/div/div/div[1]/div/article/div[1]/a')
        this.centroDeRecursosButton = page.locator('//*[@id="menu-intranet-top-3"]/a')
        this.talentoButton = page.locator('/html/body/form/div[4]/div[1]/main/div[2]/div/div/div/div[1]/div/span/div[3]/div/div/div/div/div[1]/div/article/div[3]/a')
        this.estructuraYGobiernoButton = page.locator('/html/body/form/div[4]/div[1]/main/div[2]/div/div/div/div[1]/div/span/div[3]/div/div/div/div/div[1]/div/section/div/div[1]/div/div')
    }

    private async fillUsername(username: string){
        await this.userTextBox.fill(username)
        await this.nextButton.click();
    }

    private async fillPassword(password: string){
        await this.passwordTextBox.fill(password)
    }

    private async clickSignInButton(){
        await this.signInButton.click()
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
        await this.laFirmaDropdown.click()
    }

    async clickQuienesSomosButton(){
        await this.quienesSomosButton.click()
    }

    async clickCentroDeRecursosButton(){
        await this.centroDeRecursosButton.click()
    }

    async clickTalentoButton(){
        await this.talentoButton.click()
    }

    async clickEstructuraYGobiernoButton(){
        await this.estructuraYGobiernoButton.click()
    }

}





