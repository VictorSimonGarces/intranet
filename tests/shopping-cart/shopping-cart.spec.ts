import {test, expect} from '@playwright/test'
import {faker} from '@faker-js/faker'

test('buying new products', async({page}) => {

    await page.goto('http://127.0.0.1:5501/shopping%20cart')

    for(let i=0; i<5; i++){
    await page.getByRole('button', { name: 'Añadir al carrito' }).nth(0).click();
    await page.getByRole('button', { name: 'Añadir al carrito' }).nth(1).click();
    await page.getByRole('button', { name: 'Añadir al carrito' }).nth(2).click();
    }

    await page.getByRole('button', { name: 'Ver Carrito' }).click();

    const product1Quantity = await page.locator("//tbody[@id='cart-items']//td[contains(., 'Producto 1')]/ancestor::tr//td[3]").textContent()
    const product2Quantity = await page.locator("//tbody[@id='cart-items']//td[contains(., 'Producto 2')]/ancestor::tr//td[3]").textContent()
    const product3Quantity = await page.locator("//tbody[@id='cart-items']//td[contains(., 'Producto 3')]/ancestor::tr//td[3]").textContent()

    expect(product1Quantity).toEqual('5')
    expect(product2Quantity).toEqual('5')
    expect(product3Quantity).toEqual('5')

    await page.getByRole('button', { name: 'Checkout' }).click();

    await page.getByRole('textbox', { name: 'Nombre:' }).fill('Víctor Simón Garcés');
    await page.getByRole('textbox', { name: 'Correo electrónico:' }).fill('vsimongarces@deloitte.es');
    await page.getByRole('textbox', { name: 'Dirección de entrega:' }).fill('WTCZ Zaragoza');

    await page.waitForTimeout(1000)
    await page.getByRole('link', { name: 'Información de pago' }).click();

    await page.getByRole('textbox', { name: 'Número de tarjeta:' }).fill('9090878765654343');
    await page.getByRole('textbox', { name: 'Fecha expiración:' }).fill('04/26');
    await page.getByRole('textbox', { name: 'CVV:' }).fill('111');

    await page.getByRole('button', { name: 'Pagar' }).click();
})