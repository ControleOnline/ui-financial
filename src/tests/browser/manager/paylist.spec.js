const {expect, test} = require('playwright/test');

test.describe('anonymous paylist', () => {
  test('requests a document without system chrome', async ({page}) => {
    await page.goto('/paylist');

    await expect(page.getByText('Consulte suas cobranças')).toBeVisible();
    await expect(page.getByText('CPF ou CNPJ')).toBeVisible();
    await expect(page.getByRole('button', {name: 'Consultar cobranças'})).toBeVisible();
    await expect(page.getByTestId('runtime-info-footer')).toHaveCount(0);
    await expect(page.getByRole('heading', {name: 'Minhas dívidas'})).toHaveCount(0);
  });

  test('validates the document before requesting the API', async ({page}) => {
    await page.goto('/paylist');
    await page.getByRole('textbox').fill('123');
    await page.getByRole('button', {name: 'Consultar cobranças'}).click();

    await expect(page.getByText(/CPF com 11 dígitos ou CNPJ com 14 dígitos/)).toBeVisible();
  });
});
