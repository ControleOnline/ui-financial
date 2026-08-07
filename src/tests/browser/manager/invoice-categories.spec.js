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
  summary: {},
});

const mockCategoriesApi = async page => {
  const company = {
    id: 3,
    name: 'Teste',
    alias: 'TESTE',
    panel_enabled: true,
    enabled: true,
    commercial_enabled: true,
    theme: {colors: {primary: '#0EA5E9'}},
  };

  const categories = [
    {id: 1, name: 'Vendas', context: 'receive', color: '#10b981', icon: 'shopping-cart'},
    {id: 2, name: 'Servicos', context: 'receive', color: '#0EA5E9', icon: null},
  ];

  await page.route(`${API_ORIGIN}/**`, async route => {
    const request = route.request();
    const url = new URL(request.url());
    const pathname = url.pathname.replace(/^\/+/, '');
    const method = request.method().toUpperCase();

    if (method === 'OPTIONS') {
      return route.fulfill({status: 204, headers: CORS_HEADERS, body: ''});
    }

    if (pathname === 'companies' || pathname.startsWith('people/')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(company),
      });
    }

    if (pathname === 'categories' || pathname.startsWith('categories')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(categories)),
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

test.describe('invoice categories browser smoke', () => {
  test('renders categories page with DefaultTable', async ({page}) => {
    await mockCategoriesApi(page);
    await page.goto('/invoice-categories-page?store=categories');

    await expect(page.getByText(/Categorias/i).first()).toBeVisible({timeout: 15000});
    await expect(page.getByText('Vendas')).toBeVisible();
    await expect(page.getByText('Servicos')).toBeVisible();
    await expect(page.getByPlaceholder(/Buscar categoria/i)).toBeVisible();
    await expect(page.getByRole('button', {name: /Nova categoria/i}).first()).toBeVisible();
  });
});
