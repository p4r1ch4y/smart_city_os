const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');

// Auth middleware with optional test bypass (controlled by env)
const allowTestAuth = process.env.ALLOW_TEST_AUTH === 'true';
const maybeAuth = (req, res, next) => {
  if (allowTestAuth) {
    const authHeader = req.headers.authorization || '';
    if (authHeader.includes('test')) {
      req.user = {
        id: 'test-user-123',
        email: 'test@test.com',
        isAdmin: true
      };
      return next();
    }
  }
  // Fallback to real auth
  return authMiddleware(req, res, next);
};
const EmergencyService = require('../services/emergencyService');
const DodoPaymentService = require('../services/dodoPaymentService');

// Initialize services
const emergencyService = new EmergencyService();
const dodoPaymentService = new DodoPaymentService();

/**
 * @route GET /api/emergency-services/types
 * @desc Get available emergency service types
 * @access Public
 */
router.get('/types', async (req, res) => {
  try {
    const serviceTypes = await emergencyService.getServiceTypes();
    res.json({
      success: true,
      data: serviceTypes
    });
  } catch (error) {
    console.error('Error fetching service types:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch service types'
    });
  }
});

/**
 * @route POST /api/emergency-services/calculate-fee
 * @desc Calculate fee for emergency service
 * @access Public
 */
router.post('/calculate-fee', async (req, res) => {
  try {
    const { serviceType, urgency, location, additionalServices } = req.body;

    if (!serviceType || !urgency || !location) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: serviceType, urgency, location'
      });
    }

    const feeCalculation = await emergencyService.calculateFee({
      serviceType,
      urgency,
      location,
      additionalServices: additionalServices || []
    });

    res.json({
      success: true,
      data: feeCalculation
    });
  } catch (error) {
    console.error('Error calculating fee:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to calculate service fee'
    });
  }
});

/**
 * @route POST /api/emergency-services/book
 * @desc Book emergency service and initiate payment
 * @access Private
 */
router.post('/book', maybeAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      serviceType,
      urgency,
      location,
      description,
      contactInfo,
      additionalServices
    } = req.body;

    // Validate required fields
    if (!serviceType || !urgency || !location || !description || !contactInfo) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // Create service booking
    const booking = await emergencyService.createBooking({
      userId,
      serviceType,
      urgency,
      location,
      description,
      contactInfo,
      additionalServices: additionalServices || []
    });

    // Calculate fee
    const feeCalculation = await emergencyService.calculateFee({
      serviceType,
      urgency,
      location,
      additionalServices: additionalServices || []
    });

    // Create Dodo payment session
    const paymentSession = await dodoPaymentService.createPaymentSession({
      bookingId: booking.id,
      amount: feeCalculation.totalAmount,
      currency: 'INR',
      description: `Emergency Service: ${serviceType}`,
      metadata: {
        bookingId: booking.id,
        userId,
        serviceType,
        urgency
      }
    });

    res.json({
      success: true,
      data: {
        booking,
        feeCalculation,
        paymentSession
      }
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create service booking'
    });
  }
});

/**
 * @route GET /api/emergency-services/bookings
 * @desc Get user's emergency service bookings
 * @access Private
 */
router.get('/bookings', maybeAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const bookings = await emergencyService.getUserBookings(userId, {
      page: parseInt(page),
      limit: parseInt(limit),
      status
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

/**
 * @route GET /api/emergency-services/bookings/:id
 * @desc Get specific booking details
 * @access Private
 */
router.get('/bookings/:id', maybeAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await emergencyService.getBookingById(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        error: 'Booking not found'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch booking details'
    });
  }
});

/**
 * @route POST /api/emergency-services/payment/webhook
 * @desc Handle Dodo payment webhooks
 * @access Public (webhook)
 */
router.post('/payment/webhook', async (req, res) => {
  try {
    const webhookData = req.body;
    
    // Verify webhook signature
    const isValid = await dodoPaymentService.verifyWebhook(webhookData, req.headers);
    
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid webhook signature'
      });
    }

    // Process payment status update
    const result = await emergencyService.handlePaymentUpdate(webhookData);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process payment webhook'
    });
  }
});

/**
 * @route GET /api/emergency-services/payment/:sessionId/status
 * @desc Get payment session status
 * @access Private
 */
router.get('/payment/:sessionId/status', maybeAuth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const userId = req.user.id;

    const paymentStatus = await dodoPaymentService.getPaymentStatus(sessionId, userId);

    res.json({
      success: true,
      data: paymentStatus
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payment status'
    });
  }
});

/**
 * @route GET /api/emergency-services/admin/bookings
 * @desc Get all bookings for admin dashboard
 * @access Private (Admin only)
 */
router.get('/admin/bookings', maybeAuth, async (req, res) => {
  try {
    // Check if user is admin (implement your admin check logic)
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, status, serviceType, dateFrom, dateTo } = req.query;

    const bookings = await emergencyService.getAllBookings({
      page: parseInt(page),
      limit: parseInt(limit),
      status,
      serviceType,
      dateFrom,
      dateTo
    });

    res.json({
      success: true,
      data: bookings
    });
  } catch (error) {
    console.error('Error fetching admin bookings:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch bookings'
    });
  }
});

/**
 * @route PATCH /api/emergency-services/admin/bookings/:id/status
 * @desc Update booking status (admin only)
 * @access Private (Admin only)
 */
router.patch('/admin/bookings/:id/status', maybeAuth, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    const bookingId = req.params.id;
    const { status, notes } = req.body;

    const updatedBooking = await emergencyService.updateBookingStatus(bookingId, {
      status,
      notes,
      updatedBy: req.user.id
    });

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Error updating booking status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update booking status'
    });
  }
});

module.exports = router;
