import {test, expect} from '@playwright/test'
import {faker} from '@faker-js/faker'

test('create transactions', async({page}) => {

    await page.goto('http://127.0.0.1:5501/login/login.html')

    await page.locator('input#username').fill('user')
    await page.locator('input#password').fill('pass')

    await page.locator('//button[@type=\'submit\']').click()

    for(let i=0; i<=10; i++){
    
    await page.waitForTimeout(1000)
    await page.locator('//button[contains(text(), \'Añadir transacción\')]').click()
    await page.locator('//input[@type="date"]').fill('2026-06-04')
    await page.locator('//input[@type="number"]').fill(faker.number.int({min:100, max:200}).toString())
    await page.locator('//input[@type="text"]').fill('testing')

    await page.locator("//button[contains(text(), 'Guardar')]").click()

    }

    await page.pause()
});

test('create transactions codegenarator', async ({ page }) => {
  await page.goto('http://127.0.0.1:5501/login/login.html');

  await page.getByRole('textbox', { name: 'Nombre de usuario:' }).fill('user');
  await page.getByRole('textbox', { name: 'Contraseña:' }).fill('pass');
  await page.getByRole('button', { name: 'Iniciar sesión' }).click();

  await page.waitForTimeout(2000)

  await page.getByRole('button', { name: 'Añadir transacción' }).click();
  await page.getByRole('textbox', { name: 'Fecha:' }).fill('2026-10-20');
  await page.getByRole('spinbutton', { name: 'Monto:' }).fill('300');
  await page.getByRole('textbox', { name: 'Descripción:' }).fill('foo');

  await page.getByRole('button', { name: 'Guardar' }).click();
});