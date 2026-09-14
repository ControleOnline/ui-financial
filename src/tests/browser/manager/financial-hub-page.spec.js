// fluxo: financeiro-cobranca | etapa: validacao-listagem | wiki: Smoke-Test-Flows
const {expect, test} = require('playwright/test');
const packageJson = require('../../../../../../../package.json');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');
const {loginAsAdmin} = require('../../../../../ui-tests/src/tests/helpers/adminLogin');
const {getAdminCredentials} = require('../../../../../ui-tests/src/tests/helpers/smokeCredentials');
const {captureStep} = require('../../../../../ui-tests/src/tests/helpers/smokeEvidence');

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

const isLiveSmoke = String(process.env.SMOKE_LIVE || '').trim() === '1';

const installSmokeInstrumentation = async (page, testInfo) => {
  const requestCounts = new Map();
  const requests = [];
  const responses = [];
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(String(error)));
  page.on('request', request => {
    if (!request.url().startsWith(API_ORIGIN)) return;
    const pathname = new URL(request.url()).pathname;
    requestCounts.set(pathname, (requestCounts.get(pathname) || 0) + 1);
    requests.push({method: request.method(), pathname});
  });
  page.on('response', response => {
    if (!response.url().includes('api.controleonline.com') && !response.url().includes('s.controleonline.com')) return;
    const pathname = new URL(response.url()).pathname;
    responses.push({pathname, status: response.status()});
    if (process.env.SMOKE_DEBUG === '1' && pathname === '/token') {
      console.log('[SMOKE_DEBUG] token event');
    }
  });
  page.on('requestfailed', request => {
    if (process.env.SMOKE_DEBUG === '1' && request.url().includes('token')) {
      console.log('[SMOKE_DEBUG] token event');
    }
  });
  return {requestCounts, requests, responses, pageErrors, testInfo};
};

const writeRuntimeLogs = ({requests, responses, pageErrors, testInfo}) => {
  const fs = require('fs');
  fs.writeFileSync(testInfo.outputPath('console.log'), `${pageErrors.join('\n')}\n`, 'utf8');
  fs.writeFileSync(testInfo.outputPath('network.log'), `${JSON.stringify({requests, responses}, null, 2)}\n`, 'utf8');
};

test.describe('financial hub authenticated browser smoke', () => {
  test('fluxo: financeiro-cobranca renders rows, status chips and striped backgrounds', async ({page}, testInfo) => {
    const instrumentation = await installSmokeInstrumentation(page, testInfo);
    const {requestCounts, responses, pageErrors} = instrumentation;
    if (isLiveSmoke) {
      const credentials = getAdminCredentials();
      if (!credentials.hasSecrets) throw new Error('SMOKE_LIVE=1 requires SMOKE_ADMIN_EMAIL and SMOKE_ADMIN_PASSWORD.');
      await loginAsAdmin(page, {evidenceDir: testInfo.outputDir});
    } else {
      await installAuthenticatedApi(page);
    }
    await page.goto('/financial-hub-page');
    await expect(page.getByText(/Contas a receber/i).first()).toBeVisible({timeout: 20000});
    await captureStep(page, '01-financial-hub-loaded', {dir: testInfo.outputDir});
    const firstRow = page.getByTestId('default-table-row-7941');
    const secondRow = page.getByTestId('default-table-row-7942');
    const rows = page.locator('[data-testid^="default-table-row-"]');
    if (isLiveSmoke) {
      await expect(rows.first()).toBeVisible({timeout: 20000});
    } else {
      await expect(firstRow).toBeVisible({timeout: 15000});
      await expect(secondRow).toBeVisible({timeout: 15000});
      await expect(firstRow).toContainText('Cliente Par');
      await expect(secondRow).toContainText('Cliente Ímpar');
    }
    await captureStep(page, '02-financial-rows-and-status', {dir: testInfo.outputDir});
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(0);
    for (let index = 0; index < rowCount; index += 1) {
      const style = await rows.nth(index).getAttribute('style');
      expect(style).toContain('background-color');
      expect(style).not.toMatch(/239, 68, 68|34, 197, 94/);
    }
    await page.getByText(/Contas a pagar/i).first().click();
    await expect(page.getByText(/Contas a pagar/i).first()).toBeVisible();
    await captureStep(page, '03-financial-payables-tab', {dir: testInfo.outputDir});
    await page.getByText(/Contas a receber/i).first().click();
    await expect(rows.first()).toBeVisible({timeout: 15000});
    await captureStep(page, '04-financial-receivables-restored', {dir: testInfo.outputDir});
    await captureStep(page, '05-financial-final-list', {dir: testInfo.outputDir});
    writeRuntimeLogs(instrumentation);
    expect(responses.some(({status}) => status === 401)).toBe(false);
    expect(requestCounts.get('/invoices') || requestCounts.get('/invoices/')).toBe(1);
    expect(pageErrors.filter(error => /Maximum update depth|React error #185/i.test(error))).toEqual([]);
  });
});
