// fluxo: financeiro-cobranca | etapa: validacao-listagem | wiki: Smoke-Test-Flows
const {expect, test} = require('playwright/test');
const packageJson = require('../../../../../../../package.json');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');

const APP_VERSION = packageJson?.version || '1.0.0';
const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers': 'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};
const jsonHeaders = () => ({...CORS_HEADERS, 'content-type': 'application/ld+json; charset=utf-8'});
const entries = [
  {id: 7941, invoiceType: 'invoice', price: 125.5, dueDate: '2026-09-14', description: 'Receita demonstrativa', payer: {id: 21, name: 'Cliente Par', alias: 'PAR'}, receiver: {id: 3, name: 'Teste', alias: 'TESTE'}, status: {status: 'open', color: '#ef4444'}},
  {id: 7942, invoiceType: 'invoice', price: 80, dueDate: '2026-09-15', description: 'Receita demonstrativa 2', payer: {id: 22, name: 'Cliente Ímpar', alias: 'IMPAR'}, receiver: {id: 3, name: 'Teste', alias: 'TESTE'}, status: {status: 'paid', color: '#22c55e'}},
];
const collection = member => ({member, 'hydra:member': member, totalItems: member.length, 'hydra:totalItems': member.length, summary: {sum: {price: 205.5}, financial: {totalAmount: 205.5, openAmount: 125.5, paidAmount: 80}}});

const installAuthenticatedApi = async page => {
  const requestCounts = new Map();
  const responseStatuses = [];
  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();
    requestCounts.set(pathname, (requestCounts.get(pathname) || 0) + 1);
    if (method === 'OPTIONS') return route.fulfill({status: 204, headers: CORS_HEADERS, body: ''});
    if (pathname === 'companies' || pathname.startsWith('people/')) {
      return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify({id: 3, name: 'Teste', alias: 'TESTE', panel_enabled: true, enabled: true, commercial_enabled: true, theme: {colors: {primary: '#0EA5E9'}}})});
    }
    if (pathname === 'invoices') return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection(entries))});
    return route.fulfill({status: 200, headers: jsonHeaders(), body: JSON.stringify(collection([]))});
  });
  page.on('response', response => {
    if (response.url().startsWith(API_ORIGIN)) {
      responseStatuses.push({url: response.url(), status: response.status()});
    }
  });
  await page.addInitScript(({appVersion}) => {
    const set = (key, value) => localStorage.setItem(key, value);
    set('session', JSON.stringify({id: 7, people: '/people/7', api_key: 'test-api-key', active: 1, mycompany: 3, roles: ['ROLE_ADMIN']}));
    set('config', JSON.stringify({language: 'pt-br'}));
    set('app-type', 'ERP');
    set('device', JSON.stringify({id: 'web-erp', device: 'web-erp', type: 'WEB', appName: 'Browser ERP', appVersion, buildNumber: appVersion, systemName: 'web', systemVersion: 'web', deviceType: 'web', metadata: {}}));
  }, {appVersion: APP_VERSION});
  return {requestCounts, responseStatuses};
};

test.describe('financial hub authenticated browser smoke', () => {
  test('fluxo: financeiro-cobranca renders rows, status chips and striped backgrounds', async ({page}, testInfo) => {
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(String(error)));
    const {requestCounts, responseStatuses} = await installAuthenticatedApi(page);
    await page.goto('/financial-hub-page');
    await expect(page.getByText(/Contas a receber/i).first()).toBeVisible({timeout: 20000});
    await page.screenshot({path: testInfo.outputPath('01-financial-hub-loaded.png'), fullPage: true});
    const firstRow = page.getByTestId('default-table-row-7941');
    const secondRow = page.getByTestId('default-table-row-7942');
    await expect(firstRow).toBeVisible({timeout: 15000});
    await expect(secondRow).toBeVisible({timeout: 15000});
    await expect(firstRow).toContainText('Cliente Par');
    await expect(secondRow).toContainText('Cliente Ímpar');
    await page.screenshot({path: testInfo.outputPath('02-financial-rows-and-status.png'), fullPage: true});
    const firstStyle = await firstRow.getAttribute('style');
    const secondStyle = await secondRow.getAttribute('style');
    expect(firstStyle).toContain('background-color');
    expect(secondStyle).toContain('background-color');
    expect(firstStyle).not.toContain('239, 68, 68');
    expect(secondStyle).not.toContain('34, 197, 94');
    await page.getByText(/Contas a pagar/i).first().click();
    await expect(page.getByText(/Contas a pagar/i).first()).toBeVisible();
    await page.screenshot({path: testInfo.outputPath('03-financial-payables-tab.png'), fullPage: true});
    await page.getByText(/Contas a receber/i).first().click();
    await expect(firstRow).toBeVisible({timeout: 15000});
    await page.screenshot({path: testInfo.outputPath('04-financial-receivables-restored.png'), fullPage: true});
    await expect(page.locator('[data-testid^="default-table-row-"]')).toHaveCount(2);
    await page.screenshot({path: testInfo.outputPath('05-financial-final-list.png'), fullPage: true});
    expect(responseStatuses.some(({status}) => status === 401)).toBe(false);
    expect(requestCounts.get('invoices')).toBe(1);
    expect(pageErrors.filter(error => /Maximum update depth|React error #185/i.test(error))).toEqual([]);
  });
});
