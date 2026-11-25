/**
 * Plain assertion script (no framework). Run: npx tsx supabase/functions/_shared/calmoCart_test.ts
 */
import assert from 'node:assert/strict';
import { buildCart } from './calmoCart.ts';
import { isExcludedPostcode } from './calmoCatalog.ts';

// A forged price is ignored: the catalog price (€69) is charged.
{
  const r = buildCart([{ id: 'calmo-blackout-essentials', variantId: 'standard', quantity: 2, priceEur: 0.01 }]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lines[0].unitCents, 6900);
    assert.equal(r.subtotalCents, 13800);
    assert.equal(r.shippingCents, 0, 'free shipping from €69');
  }
}

// One kit (€69) already ships free; defaults to first variant ('standard').
{
  const r = buildCart([{ id: 'calmo-blackout-essentials', quantity: 1 }]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.subtotalCents, 6900);
    assert.equal(r.shippingCents, 0);
    assert.equal(r.lines[0].variantId, 'standard', 'defaults to first variant');
  }
}

// Coming-soon products, unknown products, prototype keys, bad quantities and options are refused.
assert.equal(buildCart([{ id: 'calmo-crisis-72h', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: 'gear-weather-radio', quantity: 1 }]).ok, false, 'radio alone is no longer sold');
assert.equal(buildCart([{ id: 'free-stuff', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: '__proto__', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: 'constructor', quantity: 1 }]).ok, false);
assert.equal(buildCart([{ id: 'calmo-blackout-essentials', quantity: 0 }]).ok, false);
assert.equal(buildCart([{ id: 'calmo-blackout-essentials', quantity: 1.5 }]).ok, false);
assert.equal(buildCart([{ id: 'calmo-blackout-essentials', quantity: 11 }]).ok, false);
assert.equal(buildCart([{ id: 'calmo-blackout-essentials', quantity: 1, variantId: 'gold' }]).ok, false);
assert.equal(buildCart([]).ok, false);
assert.equal(buildCart('nope').ok, false);
assert.equal(buildCart(Array(21).fill({ id: 'calmo-blackout-essentials', quantity: 1 })).ok, false);

// Only our own image paths pass through.
{
  const r = buildCart([
    { id: 'calmo-blackout-essentials', quantity: 1, image: './images/products/calmo-blackout-essentials.webp' },
    { id: 'calmo-blackout-essentials', quantity: 1, image: 'https://evil.example/x.jpg' },
    { id: 'calmo-blackout-essentials', quantity: 1, image: '/images/../secret.png' },
  ]);
  assert.ok(r.ok);
  if (r.ok) {
    assert.equal(r.lines[0].image, '/images/products/calmo-blackout-essentials.webp');
    assert.equal(r.lines[1].image, null);
    assert.equal(r.lines[2].image, null);
  }
}

// Excluded delivery areas (mainland Spain and Portugal only).
assert.equal(isExcludedPostcode('ES', '35001'), true, 'Las Palmas');
assert.equal(isExcludedPostcode('ES', '38001'), true, 'Tenerife');
assert.equal(isExcludedPostcode('ES', '51001'), true, 'Ceuta');
assert.equal(isExcludedPostcode('ES', '28013'), false, 'Madrid');
assert.equal(isExcludedPostcode('ES', '07001'), true, 'Palma (Baleares excluded)');
assert.equal(isExcludedPostcode('PT', '9000-001'), true, 'Funchal');
assert.equal(isExcludedPostcode('PT', '1100-148'), false, 'Lisboa');

console.log('calmoCart_test: all assertions passed');
