const {expect, test} = require('playwright/test');
const packageJson = require('../../../../../../../package.json');
const {API_ORIGIN} = require('../../../../../../../src/tests/browser/apiOrigin');

const APP_VERSION = packageJson?.version || '1.0.0';

const CORS_HEADERS = {
  'access-control-allow-origin': '*',
  'access-control-allow-headers':
    'API-TOKEN, APP-DOMAIN, DEVICE, ACCEPT, CONTENT-TYPE, X-Requested-With',
  'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
};

const jsonHeaders = () => ({
  ...CORS_HEADERS,
  'content-type': 'application/ld+json; charset=utf-8',
});

const collection = member => ({
  member,
  'hydra:member': member,
  totalItems: member.length,
  'hydra:totalItems': member.length,
  summary: {
    sum: {price: 0},
    financial: {totalAmount: 0, openAmount: 0, paidAmount: 0},
  },
});

const company = {
  id: 3,
  name: 'Teste',
  alias: 'TESTE',
  panel_enabled: true,
  enabled: true,
  commercial_enabled: true,
  theme: {colors: {primary: '#0EA5E9'}},
};

const mockFinancialEntriesApi = async page => {
  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({status: 204, headers: CORS_HEADERS, body: ''});
    }

    if (
      pathname === 'companies' ||
      pathname.startsWith('people/') ||
      pathname === 'people'
    ) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'invoices' || pathname.startsWith('invoices')) {
      if (method === 'POST') {
        return route.fulfill({
          status: 201,
          headers: jsonHeaders(),
          body: JSON.stringify({
            id: 999,
            invoiceType: 'invoice',
            price: 10,
          }),
        });
      }
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection([])),
      });
    }

    return route.fulfill({
      status: 200,
      headers: jsonHeaders(),
      body: JSON.stringify(collection([])),
    });
  });

  await page.addInitScript(
    ({appVersion}) => {
      const set = (k, v) => {
        try {
          localStorage.setItem(k, v);
        } catch {}
      };
      set(
        'session',
        JSON.stringify({
          id: 7,
          people: '/people/7',
          api_key: 'test-api-key',
          active: 1,
          mycompany: 3,
          roles: ['ROLE_ADMIN'],
        }),
      );
      set('config', JSON.stringify({language: 'pt-br'}));
      set('app-type', 'ERP');
      set(
        'device',
        JSON.stringify({
          id: 'web-erp',
          device: 'web-erp',
          type: 'WEB',
          appName: 'Browser ERP',
          appVersion,
          buildNumber: appVersion,
          systemName: 'web',
          systemVersion: 'web',
          deviceType: 'web',
          metadata: {},
        }),
      );
    },
    {appVersion: APP_VERSION},
  );
};

test.describe('financial entries create browser smoke', () => {
  test('opens create modal from + button on payables page', async ({page}) => {
    await mockFinancialEntriesApi(page);
    await page.goto('/payables');

    // Page settles with company context
    await expect(
      page.getByText(/Contas a pagar|Empresa nao identificada|Carregando|Loading/i).first(),
    ).toBeVisible({timeout: 20000});

    // Avoid hard fail if translation key differs; look for add affordance
    const addButton = page
      .getByRole('button', {name: /\+|Nova|Novo|Add|Adicionar/i})
      .or(page.locator('[data-testid="default-table-add"], [aria-label*="add" i], [aria-label*="nova" i]'))
      .first();

    // If the page rendered the table, the + should be present (store.add=true)
    await expect(addButton).toBeVisible({timeout: 15000});
    await addButton.click();

    await expect(
      page.getByText(/Novo contas a pagar|newPayable|Nova conta a pagar|Novo lançamento/i).first(),
    ).toBeVisible({timeout: 10000});

    await expect(
      page.getByRole('button', {name: /Salvar|Save|Cancelar|Cancel|Fechar/i}).first(),
    ).toBeVisible({timeout: 8000});
  });
});
