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

const mockWalletsApi = async page => {
  const company = {
    id: 3,
    name: 'Teste',
    alias: 'TESTE',
    panel_enabled: true,
    enabled: true,
    commercial_enabled: true,
    theme: {colors: {primary: '#0EA5E9'}},
  };

  const wallets = [
    {
      id: 11,
      wallet: 'Caixa Principal',
      balance: 1500.5,
      walletPaymentTypes: [
        {id: 1, paymentType: {id: 5, paymentType: 'Dinheiro', frequency: 'single'}},
      ],
    },
    {
      id: 12,
      wallet: 'Banco',
      balance: 0,
      walletPaymentTypes: [],
    },
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

    if (pathname === 'wallets' || pathname.startsWith('wallets')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(collection(wallets)),
      });
    }

    if (pathname === 'payment_types' || pathname.startsWith('payment_types')) {
      return route.fulfill({
        status: 200,
        headers: jsonHeaders(),
        body: JSON.stringify(
          collection([
            {id: 5, paymentType: 'Dinheiro', frequency: 'single', installments: 'single'},
            {id: 6, paymentType: 'Pix', frequency: 'single', installments: 'single'},
          ]),
        ),
      });
    }

    if (pathname === 'wallet_payment_types' || pathname.startsWith('wallet_payment_types')) {
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

test.describe('wallets browser smoke', () => {
  test('renders wallets page with DefaultTable list', async ({page}) => {
    await mockWalletsApi(page);
    await page.goto('/wallets-page?store=wallet');

    await expect(page.getByText('Carteiras')).toBeVisible({timeout: 15000});
    await expect(page.getByText('Caixa Principal')).toBeVisible();
    await expect(page.getByText('Banco')).toBeVisible();
    await expect(page.getByPlaceholder(/Buscar carteira/i)).toBeVisible();
    await expect(page.getByRole('button', {name: /Nova carteira/i}).first()).toBeVisible();
  });
});
