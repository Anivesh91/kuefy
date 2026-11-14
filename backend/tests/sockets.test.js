const assert = require('assert');
const test = require('node:test');
const { initSockets, getIO } = require('../src/sockets/socketHandler');
const socketEmitter = require('../src/sockets/socketEmitter');

test('Socket & Privacy Tests - Phase 2', async (t) => {
  // Mock IO to verify room emissions and assert zero global broadcasts
  const emittedToRooms = [];
  let globalEmitsCount = 0;

  const mockIO = {
    to: (room) => ({
      emit: (event, payload) => {
        emittedToRooms.push({ room, event, payload });
      },
    }),
    emit: () => {
      globalEmitsCount++;
    },
    on: () => {},
  };

  initSockets(mockIO);

  await t.test('emitTicketCalled sends sanitized payload to customer/service and PII only to owner', () => {
    emittedToRooms.length = 0;
    globalEmitsCount = 0;

    socketEmitter.emitTicketCalled('t123', 's456', 'o789', {
      ticketNumber: 'A-001',
      customerName: 'Secret Customer',
      customerPhone: '9876543210',
      calledAt: '2026-11-14T00:00:00Z',
    });

    // Zero global emissions!
    assert.strictEqual(globalEmitsCount, 0, 'No global io.emit should occur!');

    // Check service room payload: MUST NOT have customerPhone
    const serviceEmission = emittedToRooms.find((e) => e.room === 'service:s456');
    assert.ok(serviceEmission, 'Should emit to service room');
    assert.strictEqual(serviceEmission.payload.ticketNumber, 'A-001');
    assert.strictEqual(serviceEmission.payload.customerPhone, undefined, 'customerPhone must be stripped from service room!');

    // Check ticket room payload
    const ticketEmission = emittedToRooms.find((e) => e.room === 'ticket:t123');
    assert.ok(ticketEmission, 'Should emit to ticket room');
    assert.strictEqual(ticketEmission.payload.customerPhone, undefined, 'customerPhone must not leak into ticket broadcast');

    // Check owner room payload: Owner operator console DOES receive customer name and phone
    const ownerEmission = emittedToRooms.find((e) => e.room === 'owner:o789');
    assert.ok(ownerEmission, 'Should emit to owner room');
    assert.strictEqual(ownerEmission.payload.customerName, 'Secret Customer');
    assert.strictEqual(ownerEmission.payload.customerPhone, '9876543210');
  });

  await t.test('emitQueueUpdated emits sanitized payload to directory and org without leaking customer PII', () => {
    emittedToRooms.length = 0;
    globalEmitsCount = 0;

    socketEmitter.emitQueueUpdated('s456', 'o789', {
      organizationId: 'org999',
      status: 'OPEN',
      waitingCount: 5,
      lastJoinedTicket: {
        ticketNumber: 'A-005',
        customerName: 'Private Name',
      },
      currentTicket: {
        id: 't123',
        ticketNumber: 'A-001',
        customerName: 'Private Name',
        customerPhone: '9876543210',
        status: 'CALLED',
      },
    });

    // Zero global emissions
    assert.strictEqual(globalEmitsCount, 0);

    // Check directory room
    const directoryEmission = emittedToRooms.find((e) => e.room === 'directory');
    assert.ok(directoryEmission, 'Should emit to directory room');
    assert.strictEqual(directoryEmission.payload.waitingCount, 5);
    assert.strictEqual(directoryEmission.payload.currentTicket.customerPhone, undefined, 'customerPhone must not leak into directory!');
    assert.strictEqual(directoryEmission.payload.currentTicket.customerName, undefined, 'customerName must not leak into directory!');
    assert.strictEqual(directoryEmission.payload.lastJoinedTicket, undefined, 'lastJoinedTicket must not leak into directory!');

    // Check org room
    const orgEmission = emittedToRooms.find((e) => e.room === 'org:org999');
    assert.ok(orgEmission, 'Should emit to org room');
    assert.strictEqual(orgEmission.payload.waitingCount, 5);
    assert.strictEqual(orgEmission.payload.currentTicket.customerPhone, undefined);

    // Check owner room: owner gets rich operational details
    const ownerEmission = emittedToRooms.find((e) => e.room === 'owner:o789');
    assert.ok(ownerEmission, 'Should emit to owner room');
    assert.strictEqual(ownerEmission.payload.currentTicket.customerPhone, '9876543210');
  });
});
