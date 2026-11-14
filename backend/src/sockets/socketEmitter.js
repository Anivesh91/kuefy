const { getIO } = require('./socketHandler');

const emitToRoom = (room, event, data) => {
  const io = getIO();
  if (io && room) {
    io.to(room).emit(event, data);
  }
};

const socketEmitter = {
  emitTicketPositionUpdated(ticketId, { peopleAhead, estimatedWaitMinutes, status }) {
    emitToRoom(`ticket:${ticketId}`, 'ticket:positionUpdated', {
      ticketId,
      peopleAhead,
      estimatedWaitMinutes,
      status,
      timestamp: new Date().toISOString(),
    });
  },

  emitTicketCalled(ticketId, serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    // Public payload sent to customer ticket room and service room (no PII like phone number)
    const publicPayload = {
      ticketId,
      serviceId,
      ticketNumber: data.ticketNumber,
      status: 'CALLED',
      calledAt: data.calledAt || timestamp,
      timestamp,
    };
    emitToRoom(`ticket:${ticketId}`, 'ticket:called', publicPayload);
    emitToRoom(`service:${serviceId}`, 'ticket:called', publicPayload);

    // Private owner payload including customer details for the operator desk
    if (ownerId) {
      emitToRoom(`owner:${ownerId}`, 'ticket:called', {
        ...publicPayload,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
      });
    }
  },

  emitTicketServing(ticketId, serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const payload = {
      ticketId,
      serviceId,
      ticketNumber: data.ticketNumber,
      status: 'SERVING',
      serviceStartedAt: data.serviceStartedAt || timestamp,
      timestamp,
    };
    emitToRoom(`ticket:${ticketId}`, 'ticket:serving', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:serving', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:serving', payload);
  },

  emitTicketCompleted(ticketId, serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const payload = {
      ticketId,
      serviceId,
      ticketNumber: data.ticketNumber,
      status: 'COMPLETED',
      completedAt: data.completedAt || timestamp,
      timestamp,
    };
    emitToRoom(`ticket:${ticketId}`, 'ticket:completed', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:completed', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:completed', payload);
  },

  emitTicketCancelled(ticketId, serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const payload = {
      ticketId,
      serviceId,
      ticketNumber: data.ticketNumber,
      status: 'CANCELLED',
      cancelledAt: data.cancelledAt || timestamp,
      message: data.message,
      timestamp,
    };
    emitToRoom(`ticket:${ticketId}`, 'ticket:cancelled', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:cancelled', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:cancelled', payload);
  },

  emitTicketNoShow(ticketId, serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const payload = {
      ticketId,
      serviceId,
      ticketNumber: data.ticketNumber,
      status: 'NO_SHOW',
      noShowAt: data.noShowAt || timestamp,
      timestamp,
    };
    emitToRoom(`ticket:${ticketId}`, 'ticket:noShow', payload);
    emitToRoom(`service:${serviceId}`, 'ticket:noShow', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'ticket:noShow', payload);
  },

  emitQueueUpdated(serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const orgId = data.organizationId ? data.organizationId.toString() : null;

    // Sanitized public payload (NO customer phone or private details)
    const publicPayload = {
      serviceId: serviceId.toString(),
      organizationId: orgId,
      status: data.status,
      waitingCount: data.waitingCount,
      currentTicket: data.currentTicket
        ? {
            id: data.currentTicket.id || data.currentTicket._id,
            ticketNumber: data.currentTicket.ticketNumber,
            status: data.currentTicket.status,
          }
        : null,
      timestamp,
    };

    emitToRoom(`service:${serviceId}`, 'queue:updated', publicPayload);
    if (orgId) emitToRoom(`org:${orgId}`, 'queue:updated', publicPayload);
    emitToRoom('directory', 'queue:updated', publicPayload);

    // Rich owner payload for the business dashboard/console
    if (ownerId) {
      emitToRoom(`owner:${ownerId}`, 'queue:updated', {
        ...publicPayload,
        lastJoinedTicket: data.lastJoinedTicket,
        currentTicket: data.currentTicket,
      });
    }
  },

  emitQueueStatusChanged(serviceId, ownerId, data = {}) {
    const timestamp = new Date().toISOString();
    const orgId = data.organizationId ? data.organizationId.toString() : null;
    const payload = {
      serviceId: serviceId.toString(),
      organizationId: orgId,
      status: data.status,
      timestamp,
    };

    emitToRoom(`service:${serviceId}`, 'queue:statusChanged', payload);
    if (orgId) emitToRoom(`org:${orgId}`, 'queue:statusChanged', payload);
    emitToRoom('directory', 'queue:statusChanged', payload);
    if (ownerId) emitToRoom(`owner:${ownerId}`, 'queue:statusChanged', payload);
  },
};

module.exports = socketEmitter;
