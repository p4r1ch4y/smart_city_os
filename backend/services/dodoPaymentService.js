const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

class DodoPaymentService {
  constructor() {
    // Dodo Payments configuration (TEST MODE)
    this.apiKey = process.env.DODO_API_KEY || 'test_dodo_api_key_demo';
    this.apiSecret = process.env.DODO_API_SECRET || 'test_dodo_api_secret_demo';
    this.baseURL = process.env.DODO_BASE_URL || 'https://api.dodopayments.com/v1';
    this.webhookSecret = process.env.DODO_WEBHOOK_SECRET || 'test_webhook_secret_demo';
    this.isTestMode = process.env.DODO_TEST_MODE !== 'false'; // Default to test mode

    // In-memory storage for demo (replace with database in production)
    this.paymentSessions = new Map();

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Dodo-Version': '2023-10-01'
      }
    });

    console.log(`🔄 DodoPaymentService initialized in ${this.isTestMode ? 'TEST' : 'LIVE'} mode`);
  }

  /**
   * Create a payment session with Dodo Payments
   */
  async createPaymentSession({
    bookingId,
    amount,
    currency = 'INR',
    description,
    metadata = {}
  }) {
    try {
      const sessionId = uuidv4();
      const timestamp = new Date().toISOString();

      // In test mode, simulate Dodo API response
      if (this.isTestMode) {
        const mockSession = {
          id: sessionId,
          object: 'payment_session',
          amount: Math.round(amount * 100), // Convert to smallest unit (paise)
          currency: currency.toLowerCase(),
          description,
          status: 'open',
          payment_status: 'unpaid',
          url: `https://checkout.dodopayments.com/pay/${sessionId}`,
          success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/services/emergency/success?session_id=${sessionId}`,
          cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/services/emergency/cancel?session_id=${sessionId}`,
          metadata: {
            ...metadata,
            bookingId,
            test_mode: true
          },
          created: Math.floor(Date.now() / 1000),
          expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour from now
        };

        // Store session locally
        this.paymentSessions.set(sessionId, {
          ...mockSession,
          createdAt: timestamp,
          bookingId
        });

        console.log(`💳 Created test payment session: ${sessionId} for booking: ${bookingId}`);
        return mockSession;
      }

      // Real Dodo API call (when not in test mode)
      const payload = {
        amount: Math.round(amount * 100), // Convert to smallest unit (paise)
        currency: currency.toLowerCase(),
        description,
        success_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/services/emergency/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3001'}/services/emergency/cancel?session_id={CHECKOUT_SESSION_ID}`,
        metadata: {
          ...metadata,
          bookingId
        }
      };

      const response = await this.axiosInstance.post('/checkout/sessions', payload);
      const session = response.data;

      // Store session locally
      this.paymentSessions.set(session.id, {
        ...session,
        createdAt: timestamp,
        bookingId
      });

      console.log(`💳 Created payment session: ${session.id} for booking: ${bookingId}`);
      return session;

    } catch (error) {
      console.error('Error creating payment session:', error.response?.data || error.message);
      
      // Fallback to test mode if API fails
      if (!this.isTestMode) {
        console.log('🔄 Falling back to test mode due to API error');
        return this.createPaymentSession({ bookingId, amount, currency, description, metadata });
      }
      
      throw new Error('Failed to create payment session');
    }
  }

  /**
   * Get payment session status
   */
  async getPaymentStatus(sessionId, userId) {
    try {
      const localSession = this.paymentSessions.get(sessionId);
      
      if (this.isTestMode || !localSession) {
        // Return mock status for test mode
        const mockStatuses = ['unpaid', 'paid', 'failed', 'cancelled'];
        const randomStatus = mockStatuses[Math.floor(Math.random() * mockStatuses.length)];
        
        return {
          id: sessionId,
          status: 'open',
          payment_status: localSession?.payment_status || 'unpaid',
          amount: localSession?.amount || 15000, // ₹150.00 in paise
          currency: localSession?.currency || 'inr',
          created: localSession?.created || Math.floor(Date.now() / 1000),
          metadata: localSession?.metadata || {}
        };
      }

      // Real API call
      const response = await this.axiosInstance.get(`/checkout/sessions/${sessionId}`);
      const session = response.data;

      // Update local storage
      this.paymentSessions.set(sessionId, {
        ...session,
        updatedAt: new Date().toISOString()
      });

      return session;

    } catch (error) {
      console.error('Error fetching payment status:', error.response?.data || error.message);
      
      // Return cached data if available
      const cachedSession = this.paymentSessions.get(sessionId);
      if (cachedSession) {
        return cachedSession;
      }
      
      throw new Error('Failed to fetch payment status');
    }
  }

  /**
   * Verify webhook signature
   */
  async verifyWebhook(payload, headers) {
    try {
      const signature = headers['dodo-signature'] || headers['x-dodo-signature'];
      
      if (this.isTestMode) {
        // In test mode, always return true for demo purposes
        console.log('🔍 Webhook verification skipped (test mode)');
        return true;
      }

      if (!signature) {
        console.error('Missing webhook signature');
        return false;
      }

      // Verify signature using HMAC SHA256
      const expectedSignature = crypto
        .createHmac('sha256', this.webhookSecret)
        .update(JSON.stringify(payload))
        .digest('hex');

      const providedSignature = signature.replace('sha256=', '');
      
      const isValid = crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(providedSignature, 'hex')
      );

      if (!isValid) {
        console.error('Invalid webhook signature');
      }

      return isValid;

    } catch (error) {
      console.error('Error verifying webhook:', error.message);
      return false;
    }
  }

  /**
   * Simulate payment completion (test mode only)
   */
  async simulatePaymentCompletion(sessionId) {
    if (!this.isTestMode) {
      throw new Error('Payment simulation only available in test mode');
    }

    const session = this.paymentSessions.get(sessionId);
    if (!session) {
      throw new Error('Payment session not found');
    }

    // Update session status
    session.payment_status = 'paid';
    session.status = 'complete';
    session.updatedAt = new Date().toISOString();

    this.paymentSessions.set(sessionId, session);

    // Return webhook-style payload
    return {
      id: uuidv4(),
      object: 'event',
      type: 'checkout.session.completed',
      data: {
        object: session
      },
      created: Math.floor(Date.now() / 1000)
    };
  }

  /**
   * Get payment session by booking ID
   */
  async getSessionByBookingId(bookingId) {
    const sessions = Array.from(this.paymentSessions.values());
    return sessions.find(session => session.bookingId === bookingId);
  }

  /**
   * Cancel payment session
   */
  async cancelPaymentSession(sessionId) {
    try {
      if (this.isTestMode) {
        const session = this.paymentSessions.get(sessionId);
        if (session) {
          session.status = 'expired';
          session.payment_status = 'cancelled';
          session.updatedAt = new Date().toISOString();
          this.paymentSessions.set(sessionId, session);
        }
        return { success: true };
      }

      // Real API call
      const response = await this.axiosInstance.post(`/checkout/sessions/${sessionId}/expire`);
      return response.data;

    } catch (error) {
      console.error('Error cancelling payment session:', error.response?.data || error.message);
      throw new Error('Failed to cancel payment session');
    }
  }

  /**
   * Get service status
   */
  getServiceStatus() {
    return {
      initialized: true,
      testMode: this.isTestMode,
      apiEndpoint: this.baseURL,
      activeSessions: this.paymentSessions.size,
      lastActivity: new Date().toISOString()
    };
  }
}

module.exports = DodoPaymentService;
