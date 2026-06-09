import { test, expect } from '@playwright/test';

test('register', async ({page}, testInfo) => {

  await page.goto('http://127.0.0.1:5500/registration/register.html');
  
    const name = 'Victor'
    const lastName = 'Simon garces'
    const age = '20'
    const country = 'Argentina'
    const email = 'vsimongarces@deloitte.es'
    const sex = 'M'

  await page.getByRole('textbox', { name: 'Nombre:' }).fill(name);
  await page.getByRole('textbox', { name: 'Apellido:' }).fill(lastName);

  await page.getByRole('spinbutton', { name: 'Edad:' }).fill(age);

  await page.getByLabel('País:').selectOption(country);

  await page.getByRole('radio', { name: sex }).check();

  await page.getByRole('textbox', { name: 'Correo electrónico:' }).fill(email);

  await page.getByRole('checkbox', { name: 'Martes' }).check();
  await page.getByRole('checkbox', { name: 'Miercoles' }).check();
  await page.getByRole('checkbox', { name: 'Jueves' }).check();
  await page.getByRole('checkbox', { name: 'Viernes' }).check();

  await page.getByRole('button', { name: 'Foto de perfil:' }).setInputFiles('images/Screenshot 2026-05-29 140525.png');

  await testInfo.attach('register1', {
    body: await page.screenshot(),
    contentType: 'image/png'
  })

  await page.screenshot({path: 'screenshots/register1.png', fullPage: true})

  const [summaryPage] = await Promise.all(
    [
        page.waitForEvent('popup'),
        page.locator("id=save-btn").click()
    ]
  )

  await summaryPage.waitForLoadState()
  await expect(summaryPage).toHaveTitle('Summary')

  const currentName = await summaryPage.locator("//strong[contains(., 'Nombre')]/ancestor::p").textContent()
  const currentLastName = await summaryPage.locator("//strong[contains(., 'Apellido')]/ancestor::p").textContent()
  const currentAge = await summaryPage.locator("//strong[contains(., 'Edad')]/ancestor::p").textContent()

  expect(currentName).toContain(name)

  await summaryPage.screenshot({path: 'screenshots/register2.png', fullPage: true})

  await testInfo.attach('register2', {
    body: await summaryPage.screenshot(),
    contentType: 'image/png'
  })

  //await page.pause()
  
});

test('registration failure', async ({page}, testInfo) => {

  await page.goto('http://127.0.0.1:5500/registration/register.html');
  
    const name = 'Victor'
    const lastName = 'Simon garces'
    const age = '20'
    const country = 'Argentina'
    const email = 'vsimongarces@deloitte.es'
    const sex = 'M'

  await page.getByRole('textbox', { name: 'Nombre:' }).fill(name);
  
  expect(true).toEqual(false)
  
});