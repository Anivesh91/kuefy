const Service = require('../models/Service');
const Organization = require('../models/Organization');
const Queue = require('../models/Queue');
const Ticket = require('../models/Ticket');
const ApiError = require('../utils/apiError');
const socketEmitter = require('../sockets/socketEmitter');
const { clearWaitingQueue } = require('../redis/queueRedis');

const getOrganizationServices = async (organizationId, includeInactive = false) => {
  const query = { organizationId };
  if (!includeInactive) {
    query.isActive = true;
  }

  const services = await Service.find(query).lean();
  const serviceIds = services.map((s) => s._id);
  const queues = await Queue.find({ serviceId: { $in: serviceIds } }).lean();

  const queueMap = {};
  queues.forEach((q) => {
    queueMap[q.serviceId.toString()] = q;
  });

  return services.map((s) => ({
    ...s,
    queue: queueMap[s._id.toString()] || { status: 'CLOSED' },
  }));
};

const getServiceById = async (serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId').lean();
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  const queue = await Queue.findOne({ serviceId: service._id }).lean();
  return {
    ...service,
    queue: queue || { status: 'CLOSED' },
  };
};

const createService = async (ownerId, organizationId, data) => {
  const org = await Organization.findById(organizationId);
  if (!org) {
    throw new ApiError(404, 'Organization not found.');
  }

  if (org.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this organization.');
  }

  const ticketPrefix = (data.ticketPrefix || 'A').toUpperCase().trim();

  const existingPrefix = await Service.findOne({ organizationId, ticketPrefix });
  if (existingPrefix) {
    throw new ApiError(409, `Ticket prefix '${ticketPrefix}' is already in use by another service in your organization.`);
  }

  const service = await Service.create({
    organizationId,
    name: data.name.trim(),
    ticketPrefix,
    description: data.description ? data.description.trim() : '',
    averageServiceTime: data.averageServiceTime || 10,
    isActive: true,
  });

  const queue = await Queue.create({
    organizationId,
    serviceId: service._id,
    status: 'CLOSED',
    currentTicketId: null,
    lastSequenceNumber: 0,
  });

  return {
    ...service.toObject(),
    queue,
  };
};

const updateService = async (ownerId, serviceId, updateData) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service.');
  }

  if (updateData.ticketPrefix) {
    const newPrefix = updateData.ticketPrefix.toUpperCase().trim();
    if (newPrefix !== service.ticketPrefix) {
      const existing = await Service.findOne({
        organizationId: service.organizationId._id,
        ticketPrefix: newPrefix,
        _id: { $ne: service._id },
      });
      if (existing) {
        throw new ApiError(409, `Ticket prefix '${newPrefix}' is already in use by another service.`);
      }
      service.ticketPrefix = newPrefix;
    }
  }

  if (updateData.name) service.name = updateData.name.trim();
  if (updateData.description !== undefined) service.description = updateData.description.trim();
  if (updateData.averageServiceTime) service.averageServiceTime = updateData.averageServiceTime;
  if (updateData.isActive !== undefined) service.isActive = updateData.isActive;

  await service.save();

  const queue = await Queue.findOne({ serviceId: service._id });
  return {
    ...service.toObject(),
    queue,
  };
};

const deactivateService = async (ownerId, serviceId) => {
  const service = await Service.findById(serviceId).populate('organizationId');
  if (!service) {
    throw new ApiError(404, 'Service not found.');
  }

  if (service.organizationId.ownerId.toString() !== ownerId.toString()) {
    throw new ApiError(403, 'Forbidden: You do not own this service.');
  }

  service.isActive = false;
  await service.save();

  const now = new Date();

  // Cancel any active tickets in this deactivated service
  const activeTickets = await Ticket.find({
    serviceId: service._id,
    status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
  });

  if (activeTickets.length > 0) {
    await Ticket.updateMany(
      {
        serviceId: service._id,
        status: { $in: ['WAITING', 'CALLED', 'SERVING'] },
      },
      {
        status: 'CANCELLED',
        cancelledAt: now,
      }
    );
  }

  await clearWaitingQueue(service._id);

  const queue = await Queue.findOne({ serviceId: service._id });
  if (queue) {
    queue.status = 'CLOSED';
    queue.currentTicketId = null;
    queue.closedAt = now;
    await queue.save();
  }

  const orgId = service.organizationId._id || service.organizationId;
  const ownerIdStr = ownerId.toString();
  const serviceIdStr = service._id.toString();

  for (const t of activeTickets) {
    socketEmitter.emitTicketCancelled(t._id.toString(), serviceIdStr, ownerIdStr, {
      ticketNumber: t.ticketNumber,
      message: 'Service has been deactivated by the organization.',
    });
  }

  socketEmitter.emitQueueStatusChanged(serviceIdStr, ownerIdStr, {
    status: 'CLOSED',
    serviceId: serviceIdStr,
    organizationId: orgId.toString(),
  });
  socketEmitter.emitQueueUpdated(serviceIdStr, ownerIdStr, {
    status: 'CLOSED',
    waitingCount: 0,
    serviceId: serviceIdStr,
    organizationId: orgId.toString(),
  });

  return { message: 'Service successfully deactivated.', service };
};

module.exports = {
  getOrganizationServices,
  getServiceById,
  createService,
  updateService,
  deactivateService,
};
