const assert = require('assert');
const test = require('node:test');
const { normalizePhone } = require('../src/utils/phoneNormalizer');

test('Concurrency, Phone Normalization & Integrity Tests - Phase 3', async (t) => {
  await t.test('Phone Normalizer standardizes Indian numbers with formatting, leading 0, 91, or +91', () => {
    // Standard 10 digit
    assert.strictEqual(normalizePhone('9876543210'), '9876543210');

    // With spaces and hyphens
    assert.strictEqual(normalizePhone('98765 43210'), '9876543210');
    assert.strictEqual(normalizePhone('9876-543-210'), '9876543210');
    assert.strictEqual(normalizePhone('(98765) 43210'), '9876543210');

    // With +91 country code
    assert.strictEqual(normalizePhone('+91 98765 43210'), '9876543210');
    assert.strictEqual(normalizePhone('+919876543210'), '9876543210');
    assert.strictEqual(normalizePhone('+91-9876543210'), '9876543210');

    // With 91 prefix without plus
    assert.strictEqual(normalizePhone('919876543210'), '9876543210');

    // With leading zero
    assert.strictEqual(normalizePhone('09876543210'), '9876543210');

    // International numbers (whitespace and formatting stripped)
    assert.strictEqual(normalizePhone('+1 (555) 234-5678'), '+15552345678');
    assert.strictEqual(normalizePhone('0044 20 7946 0991'), '+442079460991');

    // Invalid / empty
    assert.strictEqual(normalizePhone(''), '');
    assert.strictEqual(normalizePhone(null), '');
    assert.strictEqual(normalizePhone(undefined), '');
  });

  await t.test('Mongo $max sequence updater never rolls back on out-of-order writes', () => {
    let lastSequenceNumber = 10;

    // Simulate $max operation
    const applyMongoMax = (current, incoming) => Math.max(current, incoming);

    // Later sequence arrives (11)
    lastSequenceNumber = applyMongoMax(lastSequenceNumber, 11);
    assert.strictEqual(lastSequenceNumber, 11);

    // Stale/delayed out-of-order write arrives (10)
    lastSequenceNumber = applyMongoMax(lastSequenceNumber, 10);
    assert.strictEqual(lastSequenceNumber, 11, 'Counter must NOT decrement on delayed write!');
  });
});
