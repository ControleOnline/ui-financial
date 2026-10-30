const assert = require('node:assert/strict');
const {test} = global;
const {
  isValidPaylistDocument,
  normalizePaylistDocument,
} = require('../../../react/pages/paylistDocument');

test('normalizes formatted CPF and CNPJ values', () => {
  assert.equal(normalizePaylistDocument('123.456.789-01'), '12345678901');
  assert.equal(normalizePaylistDocument('12.345.678/0001-90'), '12345678000190');
});

test('accepts only CPF or CNPJ document lengths', () => {
  assert.equal(isValidPaylistDocument('12345678901'), true);
  assert.equal(isValidPaylistDocument('12345678000190'), true);
  assert.equal(isValidPaylistDocument('123'), false);
  assert.equal(isValidPaylistDocument(''), false);
});
