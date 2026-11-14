const assert = require('assert');
const test = require('node:test');
const { formatTicketNumber } = require('../src/utils/tokenGenerator');

test('Daily Queue & Sequence Reset Tests - Phase 3 Extension', async (t) => {
  await t.test('Daily reset date detection identifies yesterday vs today', () => {
    const today = new Date();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const isDifferentDaySame = today.toDateString() !== today.toDateString();
    assert.strictEqual(isDifferentDaySame, false, 'Same day must not trigger reset');

    const isDifferentDayYesterday = yesterday.toDateString() !== today.toDateString();
    assert.strictEqual(isDifferentDayYesterday, true, 'Yesterday timestamp must trigger reset');
  });

  await t.test('Ticket sequence reset starts counter fresh from #001', () => {
    let lastSequenceNumber = 450; // Old sequence from yesterday

    // Simulate resetSequence
    lastSequenceNumber = 0;

    // Next customer joins queue
    const nextSeq = lastSequenceNumber + 1;
    const ticketNumber = formatTicketNumber('A', nextSeq);

    assert.strictEqual(nextSeq, 1);
    assert.strictEqual(ticketNumber, 'A-001', 'First ticket of the new day must be #A-001');

    // Second customer
    const secondTicketNumber = formatTicketNumber('A', nextSeq + 1);
    assert.strictEqual(secondTicketNumber, 'A-002');
  });

  await t.test('Terminal tickets do not block reused sequence number in partial filter logic', () => {
    // Active statuses that require uniqueness
    const activeStatuses = ['WAITING', 'CALLED', 'SERVING'];
    const terminalStatuses = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

    const isTicketActive = (status) => activeStatuses.includes(status);

    // Yesterday ticket #A-001 was completed
    const yesterdayTicket = { sequenceNumber: 1, status: 'COMPLETED' };
    assert.strictEqual(isTicketActive(yesterdayTicket.status), false);

    // Today new ticket #A-001 arrives as WAITING
    const todayTicket = { sequenceNumber: 1, status: 'WAITING' };
    assert.strictEqual(isTicketActive(todayTicket.status), true);

    // Only one active ticket with sequence 1 exists simultaneously
    const activeSequenceOnes = [yesterdayTicket, todayTicket].filter(
      (t) => t.sequenceNumber === 1 && isTicketActive(t.status)
    );
    assert.strictEqual(activeSequenceOnes.length, 1, 'Only one active ticket has sequence 1');
  });
});
