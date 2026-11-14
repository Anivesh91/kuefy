const Queue = require('../models/Queue');
const Service = require('../models/Service');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');
const socketEmitter = require('../sockets/socketEmitter');
const { getWaitingCount, clearWaitingQueue, pushWaitingTicket, resetSequence } = require('../redis/queueRedis');

const getPublicQueue = async (serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId', 'name slug category').lean();
  if (!service || !service.isActive) {
    throw new ApiError(404, 'Service not found or inactive.');
  }

  let queue = await Queue.findOne({ serviceId }).lean();
  if (!queue) {
    queue = await Queue.create({
      organizationId: service.organizationId._id,
      serviceId: service._id,
      status: 'CLOSED',
      currentTicketId: null,
      lastSequenceNumber: 0,
    });
  }

  const waitingCount = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
  });

  const estimatedWait = waitingCount * (service.averageServiceTime || 10);

  let currentTicketSummary = null;
  if (queue.currentTicketId) {
    const currentTicket = await Ticket.findById(queue.currentTicketId).lean();
    if (currentTicket && ['CALLED', 'SERVING'].includes(currentTicket.status)) {
      currentTicketSummary = {
        ticketNumber: currentTicket.ticketNumber,
        status: currentTicket.status,
        calledAt: currentTicket.calledAt,
        serviceStartedAt: currentTicket.serviceStartedAt,
      };
    }
  }

  return {
    serviceId: service._id,
    serviceName: service.name,
    ticketPrefix: service.ticketPrefix,
    averageServiceTime: service.averageServiceTime,
    organization: service.organizationId,
    status: queue.status,
    waitingCount,
    estimatedWait,
    currentTicket: currentTicketSummary,
  };
};

const getManageQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  let queue = await Queue.findOne({ serviceId });
  if (!queue) {
    queue = await Queue.create({
      organizationId: service.organizationId._id,
      serviceId: service._id,
      status: 'CLOSED',
      currentTicketId: null,
      lastSequenceNumber: 0,
    });
  }

  let currentTicket = null;
  if (queue.currentTicketId) {
    currentTicket = await Ticket.findById(queue.currentTicketId);
  }

  const waitingTickets = await Ticket.find({
    serviceId,
    status: 'WAITING',
  })
    .sort({ sequenceNumber: 1 })
    .lean();

  return {
    service,
    queue,
    currentTicket,
    waitingTickets,
    waitingCount: waitingTickets.length,
  };
};

const openQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  // Preserve existing currentTicketId if it is actively CALLED or SERVING
  const existingQueue = await Queue.findOne({ serviceId });
  let keepCurrentTicket = false;
  if (existingQueue && existingQueue.currentTicketId) {
    const activeCurrent = await Ticket.findById(existingQueue.currentTicketId);
    if (activeCurrent && ['CALLED', 'SERVING'].includes(activeCurrent.status)) {
      keepCurrentTicket = true;
    }
  }

  // Resynchronize Redis waiting queue with MongoDB source of truth
  await clearWaitingQueue(serviceId);
  const waitingTickets = await Ticket.find({ serviceId, status: 'WAITING' })
    .sort({ sequenceNumber: 1 })
    .select('_id');

  for (const t of waitingTickets) {
    await pushWaitingTicket(serviceId, t._id);
  }

  const updateFields = {
    status: 'OPEN',
    openedAt: existingQueue?.openedAt || new Date(),
  };
  if (!keepCurrentTicket) {
    updateFields.currentTicketId = null;
  }

  // Automatic daily reset: if opening on a fresh calendar day with no active ticket carried over
  const now = new Date();
  const lastReset = existingQueue?.lastResetDate ? new Date(existingQueue.lastResetDate) : null;
  const isDifferentDay = !lastReset || lastReset.toDateString() !== now.toDateString();
  if (isDifferentDay && !keepCurrentTicket) {
    updateFields.lastSequenceNumber = 0;
    updateFields.lastResetDate = now;
    await resetSequence(serviceId, 0);
  }

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    { $set: updateFields },
    { new: true, upsert: true }
  );

  const waitingCount = waitingTickets.length;
  const orgId = service.organizationId._id || service.organizationId;

  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, {
    status: 'OPEN',
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, {
    status: 'OPEN',
    waitingCount,
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });

  return queue;
};

const closeQueue = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  const now = new Date();

  const activeTickets = await Ticket.find({
    serviceId,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  });

  await Ticket.updateMany(
    {
      serviceId,
      status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
    },
    {
      status: 'CANCELLED',
      cancelledAt: now,
    }
  );

  await clearWaitingQueue(serviceId);

  const queue = await Queue.findOneAndUpdate(
    { serviceId },
    {
      status: 'CLOSED',
      closedAt: now,
      currentTicketId: null,
    },
    { new: true, upsert: true }
  );

  const orgId = service.organizationId._id || service.organizationId;

  for (const t of activeTickets) {
    socketEmitter.emitTicketCancelled(t._id, serviceId, ownerId, {
      ticketNumber: t.ticketNumber,
      customerName: t.customerName,
      message: 'Queue was closed by the organization.',
    });
  }

  socketEmitter.emitQueueStatusChanged(serviceId, ownerId, {
    status: 'CLOSED',
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });
  socketEmitter.emitQueueUpdated(serviceId, ownerId, {
    status: 'CLOSED',
    waitingCount: 0,
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });

  return queue;
};

const resetQueueSequence = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service queue.');
  }

  const existingQueue = await Queue.findOne({ serviceId });
  if (!existingQueue) {
    throw new ApiError(404, 'Queue not found.');
  }

  // Clear Redis sequence key and reset MongoDB sequence counter to 0
  await resetSequence(serviceId, 0);

  const updatedQueue = await Queue.findOneAndUpdate(
    { serviceId },
    {
      $set: {
        lastSequenceNumber: 0,
        lastResetDate: new Date(),
      },
    },
    { new: true }
  );

  const waitingCount = await Ticket.countDocuments({
    serviceId,
    status: 'WAITING',
  });
  const orgId = service.organizationId._id || service.organizationId;

  socketEmitter.emitQueueUpdated(serviceId, ownerId, {
    status: updatedQueue.status,
    waitingCount,
    lastSequenceNumber: 0,
    serviceId: serviceId.toString(),
    organizationId: orgId.toString(),
  });

  return updatedQueue;
};

module.exports = {
  getPublicQueue,
  getManageQueue,
  openQueue,
  closeQueue,
  resetQueueSequence,
};
