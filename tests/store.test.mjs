import test from 'node:test';
import assert from 'node:assert/strict';
import { initialWallet, redeemGift } from '../src/features/store/model.ts';
test('redemption deducts points and records history without mutating prior wallet', () => {
  const wallet = redeemGift(initialWallet, 'tote');
  assert.equal(wallet.balance, 750);
  assert.equal(wallet.history[0].points, 500);
  assert.equal(initialWallet.balance, 1250);
});
test('duplicate, unknown and unaffordable gifts cannot change wallet', () => {
  const wallet = redeemGift(initialWallet, 'tote');
  assert.equal(redeemGift(wallet, 'tote'), wallet);
  assert.equal(redeemGift(wallet, 'bottle'), wallet);
  assert.equal(redeemGift(wallet, 'unknown'), wallet);
});
test('exact balance can be redeemed to zero', () => {
  const wallet = redeemGift({ balance: 250, redeemed: [], history: [] }, 'pin');
  assert.equal(wallet.balance, 0);
  assert.equal(wallet.redeemed.length, 1);
});
