import { Locator, Page } from "@playwright/test";

export class AddTransactionPage{

    private readonly addTransactionButton: Locator
    private readonly transactionDate: Locator
    private readonly transactionAmount: Locator
    private readonly transactionDescription: Locator
    private readonly saveTransactionButton: Locator
    private readonly page: Page
    
    private actualDateRow!: Locator
    private actualAmountRow!: Locator
    private actualDescriptionRow!: Locator

    constructor(page: Page){
            this.page = page
            this.addTransactionButton = page.getByRole('button', { name: 'Añadir transacción' })
            this.transactionDate = page.locator('//input[@type="date"]')
            this.transactionAmount = page.locator('//input[@type="number"]')
            this.transactionDescription = page.locator('//input[@type="text"]')
            this.saveTransactionButton = page.locator("//button[contains(text(), 'Guardar')]")
    }

    async addTransaction(date: string, amount: string, description: string){
        await this.addTransactionButton.click()
        await this.transactionDate.fill(date)
        await this.transactionAmount.fill(amount)
        await this.transactionDescription.fill(description)
        await this.saveTransactionButton.click()
    }

    async getActualAmount(row:string){
        this.actualAmountRow = this.page.locator(`//tbody[@id='transactions-list']//tr[${row}]//td[2]`)
        return await this.actualAmountRow.textContent()
    }

    async getActualDate(row:string){
        this.actualDateRow = this.page.locator(`//tbody[@id='transactions-list']//tr[${row}]//td[1]`)
        return await this.actualDateRow.textContent()
    }

    async getActualDescription(row:string){
        this.actualDescriptionRow = this.page.locator(`//tbody[@id='transactions-list']//tr[${row}]//td[3]`)
        return await this.actualDescriptionRow.textContent()
    }
}
