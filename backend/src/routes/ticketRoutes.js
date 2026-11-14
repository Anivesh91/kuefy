const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { protectOwner } = require('../middlewares/authMiddleware');
const validate = require('../middlewares/validationMiddleware');
const {
  publicTokenValidator,
  lookupTicketsValidator,
  mongoIdParamValidator,
} = require('../validators/schemas');

router.get('/lookup', lookupTicketsValidator, validate, ticketController.lookupTickets);
router.get('/push/vapid-public-key', ticketController.getVapidPublicKey);
router.get('/:publicToken', publicTokenValidator, validate, ticketController.trackTicket);
router.post('/:publicToken/cancel', publicTokenValidator, validate, ticketController.cancelTicket);
router.post('/:publicToken/subscribe-push', publicTokenValidator, validate, ticketController.subscribePush);

router.post('/:ticketId/start', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.startServing);
router.post('/:ticketId/complete', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.completeTicket);
router.post('/:ticketId/no-show', protectOwner, mongoIdParamValidator('ticketId'), validate, ticketController.markNoShow);

module.exports = router;
