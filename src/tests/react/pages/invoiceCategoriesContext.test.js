/* global describe, expect, it */

const backendContext = ctx => (ctx === 'receiver' ? 'receive' : ctx);
const frontendContext = ctx => (ctx === 'receive' ? 'receiver' : ctx);

describe('invoice categories context mapping (#289)', () => {
  it('maps receiver to receive for backend', () => {
    expect(backendContext('receiver')).toBe('receive');
    expect(backendContext('payer')).toBe('payer');
  });

  it('maps receive to receiver for frontend', () => {
    expect(frontendContext('receive')).toBe('receiver');
    expect(frontendContext('payer')).toBe('payer');
  });
});
