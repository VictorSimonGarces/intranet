import { Locator, Page } from "@playwright/test"

export class LoginPage{

    private readonly usernameTextBox: Locator
    private readonly passwordTextBox: Locator
    private readonly loginButton: Locator

    constructor(page: Page){
        this.usernameTextBox = page.locator('input#username')
        this.passwordTextBox = page.locator('input#password')
        this.loginButton = page.locator('//button[@type=\'submit\']')
    }

    private async fillUsername(username: string){
        await this.usernameTextBox.fill(username)
    }

    private async fillPassword(password: string){
        await this.passwordTextBox.fill(password)
    }

    private async clickLoginButton(){
        await this.loginButton.click()
    }

    async doLogin(username: string, password: string){
        await this.fillUsername(username)
        await this.fillPassword(password)
        await this.clickLoginButton()
    }
}