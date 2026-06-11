import {test, expect} from '@playwright/test'
import { LoginPage } from '../../pageobjects/login/LoginPage';
import { AddTransactionPage } from '../../pageobjects/add-transactions/AddTransactionsPage';
import {faker} from '@faker-js/faker'
import { NavigateTo } from '../../pageobjects/navigate/NavigateTo';

test('login with Page Object', async({page}) => {
 
    await test.step('Navigation to login page', async () => {
        const navigateTo = new NavigateTo(page)
        await navigateTo.loginPage()
    })

    const username = 'user'
    const password = 'pass'

    const transactionDate = '2027-03-21'
    const transactionAmount = faker.number.int({min: 500, max: 5000}).toString()
    const transactionDescription = faker.food.description()

    await test.step('Login to the application', async () => {
        const loginPage = new LoginPage(page)
        await loginPage.doLogin(username, password)
    })

    await test.step('Add transaction and verify it', async () => {
        const addTransactionPage = new AddTransactionPage(page)
        await page.waitForTimeout(1000)
        await addTransactionPage.addTransaction(transactionDate, transactionAmount, transactionDescription)

        expect(await addTransactionPage.getActualDate('1')).toEqual(transactionDate)
        expect(await addTransactionPage.getActualAmount('1')).toEqual(transactionAmount)
        expect(await addTransactionPage.getActualDescription('1')).toEqual(transactionDescription)
    })

    await page.pause()

});

test('login', async({page}) => {

    await page.goto('http://127.0.0.1:5501/login/login.html')

    await page.locator('input#username').fill('user')
    await page.locator('input#password').fill('pass')

    await page.locator('//button[@type=\'submit\']').click()
    
    await page.waitForTimeout(1000)
    await page.getByRole('button', { name: 'Añadir transacción' }).click();

    await page.locator('//input[@type="date"]').fill('2026-06-04')
    await page.locator('//input[@type="number"]').fill('500')
    await page.locator('//input[@type="text"]').fill('testing')

    await page.locator("//button[contains(text(), 'Guardar')]").click()

    const actualDate = await page.locator("//tbody[@id='transactions-list']//tr[1]//td[1]").textContent()
    const actualAmount = await page.locator("//tbody[@id='transactions-list']//tr[1]//td[2]").textContent()
    const actualDescription = await page.locator("//tbody[@id='transactions-list']//tr[1]//td[3]").textContent()

    expect(actualDate).toEqual('2026-06-04')
    expect(actualAmount).toEqual('500')
    expect(actualDescription).toEqual('testing')

    await page.pause()

});