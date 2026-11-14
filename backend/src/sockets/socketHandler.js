const jwt = require('jsonwebtoken');
const Ticket = require('../models/Ticket');

let ioInstance = null;

const initSockets = (io) => {
  ioInstance = io;

  io.on('connection', (socket) => {
    socket.on('join:ticket', async ({ publicToken, ticketId }) => {
      try {
        let resolvedTicketId = ticketId;
        if (!resolvedTicketId && publicToken) {
          const ticket = await Ticket.findOne({ publicToken }).select('_id');
          if (ticket) {
            resolvedTicketId = ticket._id.toString();
          }
        }

        if (resolvedTicketId) {
          socket.join(`ticket:${resolvedTicketId}`);
        }
      } catch (err) {
        console.error('[Socket join:ticket error]', err.message);
      }
    });

    socket.on('join:service', ({ serviceId }) => {
      if (serviceId) {
        socket.join(`service:${serviceId}`);
      }
    });

    socket.on('join:owner', ({ token }) => {
      if (!token) return;
      try {
        const secret = process.env.JWT_SECRET || 'queueless_secret';
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.id) {
          socket.join(`owner:${decoded.id}`);
        }
      } catch (err) {
        // invalid token: do not join room
      }
    });

    socket.on('join:org', ({ orgId }) => {
      if (orgId) {
        socket.join(`org:${orgId}`);
      }
    });

    socket.on('join:directory', () => {
      socket.join('directory');
    });

    socket.on('leave:ticket', ({ ticketId }) => {
      if (ticketId) socket.leave(`ticket:${ticketId}`);
    });

    socket.on('leave:service', ({ serviceId }) => {
      if (serviceId) socket.leave(`service:${serviceId}`);
    });

    socket.on('leave:owner', ({ token }) => {
      if (!token) return;
      try {
        const secret = process.env.JWT_SECRET || 'queueless_secret';
        const decoded = jwt.verify(token, secret);
        if (decoded && decoded.id) {
          socket.leave(`owner:${decoded.id}`);
        }
      } catch (err) {}
    });

    socket.on('leave:org', ({ orgId }) => {
      if (orgId) socket.leave(`org:${orgId}`);
    });

    socket.on('leave:directory', () => {
      socket.leave('directory');
    });
  });

  return io;
};

const getIO = () => ioInstance;

module.exports = {
  initSockets,
  getIO,
};
