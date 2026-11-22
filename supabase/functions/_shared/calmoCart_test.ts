/**
 * Plain assertion script (no framework). Run: npx tsx supabase/functions/_shared/calmoCart_test.ts
 */
import assert from 'node:assert/strict';
import { buildCart } from './calmoCart.ts';
import { isExcludedPostcode } from './calmoCatalog.ts';

// A forged price is ignored: the catalog price is charged.
{
  const r = buildCart([{ id: 'calmo-crisis-72h', variantId: 'ember', quantity: 1, priceEur: 0.01 }]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lines[0].unitCents, 14900);
    assert.equal(r.subtotalCents, 14900);
    assert.equal(r.shippingCents, 0, 'free shipping from €69');
  }
}

// Below €69 pays €5.90 shipping; decimals stay exact in cents.
{
  const r = buildCart([{ id: 'gear-water-filter', quantity: 1 }]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.subtotalCents, 3490);
    assert.equal(r.shippingCents, 590);
    assert.equal(r.lines[0].variantId, 'graphite', 'defaults to first variant');
  }
}

// Unknown products, prototype keys, bad quantities and options are refused.
assert.equal(buildCart([{ id: 'free-stuff', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: '__proto__', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: 'constructor', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: 'gear-meal-pack', quantity: 0 }]).ok, false);
assert.equal(buildCart([{ id: 'gear-meal-pack', quantity: 1.5 }]).ok, false);
assert.equal(buildCart([{ id: 'gear-meal-pack', quantity: 11 }]).ok, false);
assert.equal(buildCart([{ id: 'gear-meal-pack', quantity: 1, variantId: 'gold' }]).ok, false);
assert.equal(buildCart([]).ok, false);
assert.equal(buildCart('nope').ok, false);
assert.equal(buildCart(Array(21).fill({ id: 'gear-meal-pack', quantity: 1 })).ok, false);

// Only our own image paths pass through.
{
  const r = buildCart([
    { id: 'gear-meal-pack', quantity: 1, image: './images/real/meal.jpg' },
    { id: 'gear-meal-pack', quantity: 1, image: 'https://evil.example/x.jpg' },
    { id: 'gear-meal-pack', quantity: 1, image: '/images/../secret.png' },
  ]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lines[0].image, '/images/real/meal.jpg');
    assert.equal(r.lines[1].image, null);
    assert.equal(r.lines[2].image, null);
  }
}

// Excluded delivery areas.
assert.equal(isExcludedPostcode('ES', '35001'), true, 'Las Palmas');
assert.equal(isExcludedPostcode('ES', '38001'), true, 'Tenerife');
assert.equal(isExcludedPostcode('ES', '51001'), true, 'Ceuta');
assert.equal(isExcludedPostcode('ES', '28013'), false, 'Madrid');
assert.equal(isExcludedPostcode('ES', '07001'), false, 'Palma (Baleares ok)');
assert.equal(isExcludedPostcode('PT', '9000-001'), true, 'Funchal');
assert.equal(isExcludedPostcode('PT', '1100-148'), false, 'Lisboa');

console.log('calmoCart_test: all assertions passed');
