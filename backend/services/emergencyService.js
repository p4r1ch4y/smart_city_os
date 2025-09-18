const { v4: uuidv4 } = require('uuid');

class EmergencyService {
  constructor() {
    // In-memory storage for demo (replace with database in production)
    this.bookings = new Map();
    this.serviceTypes = [
      {
        id: 'ambulance',
        name: 'Ambulance Service',
        description: 'Emergency medical transportation',
        baseFee: 150.00,
        urgencyMultipliers: {
          low: 1.0,
          medium: 1.2,
          high: 1.5,
          critical: 2.0
        },
        additionalServices: [
          { id: 'paramedic', name: 'Paramedic Support', fee: 75.00 },
          { id: 'oxygen', name: 'Oxygen Support', fee: 25.00 },
          { id: 'cardiac', name: 'Cardiac Equipment', fee: 100.00 }
        ]
      },
      {
        id: 'fire',
        name: 'Fire Department',
        description: 'Fire emergency response',
        baseFee: 200.00,
        urgencyMultipliers: {
          low: 1.0,
          medium: 1.3,
          high: 1.6,
          critical: 2.2
        },
        additionalServices: [
          { id: 'hazmat', name: 'Hazmat Team', fee: 300.00 },
          { id: 'rescue', name: 'Rescue Equipment', fee: 150.00 },
          { id: 'ladder', name: 'Ladder Truck', fee: 100.00 }
        ]
      },
      {
        id: 'police',
        name: 'Police Emergency',
        description: 'Law enforcement emergency response',
        baseFee: 100.00,
        urgencyMultipliers: {
          low: 1.0,
          medium: 1.1,
          high: 1.3,
          critical: 1.8
        },
        additionalServices: [
          { id: 'swat', name: 'SWAT Team', fee: 500.00 },
          { id: 'k9', name: 'K-9 Unit', fee: 75.00 },
          { id: 'detective', name: 'Detective Unit', fee: 125.00 }
        ]
      },
      {
        id: 'rescue',
        name: 'Search & Rescue',
        description: 'Emergency search and rescue operations',
        baseFee: 250.00,
        urgencyMultipliers: {
          low: 1.0,
          medium: 1.4,
          high: 1.7,
          critical: 2.5
        },
        additionalServices: [
          { id: 'helicopter', name: 'Helicopter Support', fee: 1000.00 },
          { id: 'diving', name: 'Diving Team', fee: 300.00 },
          { id: 'mountain', name: 'Mountain Rescue', fee: 400.00 }
        ]
      }
    ];
  }

  /**
   * Get all available service types
   */
  async getServiceTypes() {
    return this.serviceTypes;
  }

  /**
   * Calculate fee for emergency service
   */
  async calculateFee({ serviceType, urgency, location, additionalServices = [] }) {
    const service = this.serviceTypes.find(s => s.id === serviceType);
    if (!service) {
      throw new Error('Invalid service type');
    }

    const urgencyMultiplier = service.urgencyMultipliers[urgency] || 1.0;
    const baseFee = service.baseFee * urgencyMultiplier;

    // Calculate additional services cost
    let additionalServicesCost = 0;
    const selectedAdditionalServices = [];

    additionalServices.forEach(serviceId => {
      const additionalService = service.additionalServices.find(as => as.id === serviceId);
      if (additionalService) {
        additionalServicesCost += additionalService.fee;
        selectedAdditionalServices.push(additionalService);
      }
    });

    // Location-based surcharge (demo logic)
    let locationSurcharge = 0;
    const locationLower = location.toLowerCase();
    if (locationLower.includes('remote') || locationLower.includes('rural') ||
        locationLower.includes('mountain') || locationLower.includes('miles from')) {
      locationSurcharge = baseFee * 0.2; // 20% surcharge for remote areas
    }

    const subtotal = baseFee + additionalServicesCost + locationSurcharge;
    const TAX_RATE = parseFloat(process.env.TAX_RATE || '0.18'); // 18% GST by default (India)
    const tax = subtotal * TAX_RATE;
    const totalAmount = subtotal + tax;

    return {
      serviceType: service.name,
      currency: 'INR',
      baseFee,
      urgency,
      urgencyMultiplier,
      additionalServices: selectedAdditionalServices,
      additionalServicesCost,
      locationSurcharge,
      subtotal,
      tax,
      totalAmount: Math.round(totalAmount * 100) / 100 // Round to 2 decimal places
    };
  }

  /**
   * Create a new emergency service booking
   */
  async createBooking({
    userId,
    serviceType,
    urgency,
    location,
    description,
    contactInfo,
    additionalServices = []
  }) {
    const bookingId = uuidv4();
    const timestamp = new Date().toISOString();

    const feeCalculation = await this.calculateFee({
      serviceType,
      urgency,
      location,
      additionalServices
    });

    const booking = {
      id: bookingId,
      userId,
      serviceType,
      urgency,
      location,
      description,
      contactInfo,
      additionalServices,
      feeCalculation,
      status: 'pending_payment',
      paymentStatus: 'pending',
      createdAt: timestamp,
      updatedAt: timestamp
    };

    this.bookings.set(bookingId, booking);
    return booking;
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(userId, { page = 1, limit = 10, status } = {}) {
    const userBookings = Array.from(this.bookings.values())
      .filter(booking => booking.userId === userId)
      .filter(booking => !status || booking.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = userBookings.slice(startIndex, endIndex);

    return {
      bookings: paginatedBookings,
      pagination: {
        page,
        limit,
        total: userBookings.length,
        totalPages: Math.ceil(userBookings.length / limit)
      }
    };
  }

  /**
   * Get booking by ID
   */
  async getBookingById(bookingId, userId) {
    const booking = this.bookings.get(bookingId);
    if (!booking || booking.userId !== userId) {
      return null;
    }
    return booking;
  }

  /**
   * Get all bookings (admin)
   */
  async getAllBookings({
    page = 1,
    limit = 20,
    status,
    serviceType,
    dateFrom,
    dateTo
  } = {}) {
    let allBookings = Array.from(this.bookings.values());

    // Apply filters
    if (status) {
      allBookings = allBookings.filter(booking => booking.status === status);
    }
    if (serviceType) {
      allBookings = allBookings.filter(booking => booking.serviceType === serviceType);
    }
    if (dateFrom) {
      allBookings = allBookings.filter(booking => 
        new Date(booking.createdAt) >= new Date(dateFrom)
      );
    }
    if (dateTo) {
      allBookings = allBookings.filter(booking => 
        new Date(booking.createdAt) <= new Date(dateTo)
      );
    }

    // Sort by creation date (newest first)
    allBookings.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBookings = allBookings.slice(startIndex, endIndex);

    return {
      bookings: paginatedBookings,
      pagination: {
        page,
        limit,
        total: allBookings.length,
        totalPages: Math.ceil(allBookings.length / limit)
      }
    };
  }

  /**
   * Update booking status
   */
  async updateBookingStatus(bookingId, { status, notes, updatedBy }) {
    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    booking.status = status;
    booking.updatedAt = new Date().toISOString();
    booking.updatedBy = updatedBy;
    
    if (notes) {
      booking.notes = notes;
    }

    this.bookings.set(bookingId, booking);
    return booking;
  }

  /**
   * Handle payment status updates from Dodo Payments
   */
  async handlePaymentUpdate(webhookData) {
    const { sessionId, status, metadata } = webhookData;
    const bookingId = metadata?.bookingId;

    if (!bookingId) {
      throw new Error('Booking ID not found in webhook metadata');
    }

    const booking = this.bookings.get(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    // Update payment status
    booking.paymentStatus = status;
    booking.paymentSessionId = sessionId;
    booking.updatedAt = new Date().toISOString();

    // Update booking status based on payment status
    switch (status) {
      case 'completed':
        booking.status = 'confirmed';
        break;
      case 'failed':
        booking.status = 'payment_failed';
        break;
      case 'cancelled':
        booking.status = 'cancelled';
        break;
      default:
        booking.status = 'pending_payment';
    }

    this.bookings.set(bookingId, booking);
    return booking;
  }
}

module.exports = EmergencyService;
