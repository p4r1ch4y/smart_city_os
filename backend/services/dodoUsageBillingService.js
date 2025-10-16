const axios = require('axios');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');

/**
 * Dodo Payments Usage-Based Billing Service
 * Implements postpaid billing for Smart City OS emergency services
 * 
 * Workflow:
 * 1. User books emergency service -> Record usage event
 * 2. Dodo meter aggregates events (COUNT) monthly
 * 3. Auto-generate invoice at end of billing cycle
 * 4. Users pay postpaid bill
 */
class DodoUsageBillingService {
  constructor() {
    // Dodo Payments API configuration
    this.apiKey = process.env.DODO_API_KEY || 'test_dodo_api_key_demo';
    this.apiSecret = process.env.DODO_API_SECRET || 'test_dodo_api_secret_demo';
    this.baseURL = process.env.DODO_BASE_URL || 'https://api.dodopayments.com/v1';
    this.webhookSecret = process.env.DODO_WEBHOOK_SECRET || 'test_webhook_secret_demo';
    this.isTestMode = process.env.DODO_TEST_MODE !== 'false';

    // Usage billing configuration
    this.meterId = process.env.DODO_METER_ID || 'emergency_services_meter';
    this.billingCycle = process.env.DODO_BILLING_CYCLE || 'monthly';
    this.billingUnit = process.env.DODO_BILLING_UNIT || 'service';

    // In-memory storage for demo (replace with database in production)
    this.usageEvents = new Map();
    this.customerMeters = new Map();
    this.invoices = new Map();

    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      timeout: 30000,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'X-Dodo-Version': '2023-10-01'
      }
    });

    console.log(`📊 DodoUsageBillingService initialized in ${this.isTestMode ? 'TEST' : 'LIVE'} mode`);
    console.log(`📏 Meter: ${this.meterId}, Billing: ${this.billingCycle}, Unit: ${this.billingUnit}`);
  }

  /**
   * Record a usage event when user books an emergency service
   * This is the core function called after successful booking
   */
  async recordUsageEvent({
    userId,
    bookingId,
    serviceType,
    urgency,
    location,
    metadata = {}
  }) {
    try {
      const eventId = uuidv4();
      const timestamp = new Date().toISOString();

      const usageEvent = {
        event_id: eventId,
        customer_id: userId,
        meter_id: this.meterId,
        event_name: 'emergency.service',
        timestamp: timestamp,
        properties: {
          booking_id: bookingId,
          service_type: serviceType,
          urgency: urgency,
          location: location,
          billing_unit: this.billingUnit,
          quantity: 1, // Each booking = 1 service unit
          ...metadata
        }
      };

      if (this.isTestMode) {
        // Store locally for demo
        this.usageEvents.set(eventId, usageEvent);
        
        // Update customer meter
        await this.updateCustomerMeter(userId, 1);
        
        console.log(`📈 Recorded usage event: ${eventId} for user: ${userId} (booking: ${bookingId})`);
        return {
          success: true,
          event_id: eventId,
          message: 'Usage event recorded successfully'
        };
      }

      // Real Dodo API call
      const response = await this.axiosInstance.post('/usage/events', usageEvent);
      
      // Store locally for tracking
      this.usageEvents.set(eventId, {
        ...usageEvent,
        dodo_response: response.data
      });

      console.log(`📈 Recorded usage event: ${eventId} for user: ${userId}`);
      return response.data;

    } catch (error) {
      console.error('Error recording usage event:', error.response?.data || error.message);
      
      // Fallback to local storage in case of API failure
      if (!this.isTestMode) {
        console.log('🔄 Falling back to local storage due to API error');
        return this.recordUsageEvent({ userId, bookingId, serviceType, urgency, location, metadata });
      }
      
      throw new Error('Failed to record usage event');
    }
  }

  /**
   * Update customer meter (local tracking for demo)
   */
  async updateCustomerMeter(userId, quantity = 1) {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
    const meterKey = `${userId}_${currentMonth}`;
    
    const currentUsage = this.customerMeters.get(meterKey) || {
      customer_id: userId,
      meter_id: this.meterId,
      period: currentMonth,
      usage_count: 0,
      last_updated: new Date().toISOString()
    };

    currentUsage.usage_count += quantity;
    currentUsage.last_updated = new Date().toISOString();
    
    this.customerMeters.set(meterKey, currentUsage);
    
    return currentUsage;
  }

  /**
   * Get customer usage summary for current billing period
   */
  async getCustomerUsage(userId, period = null) {
    try {
      const targetPeriod = period || new Date().toISOString().slice(0, 7);
      const meterKey = `${userId}_${targetPeriod}`;

      if (this.isTestMode) {
        const usage = this.customerMeters.get(meterKey) || {
          customer_id: userId,
          meter_id: this.meterId,
          period: targetPeriod,
          usage_count: 0,
          last_updated: new Date().toISOString()
        };

        return {
          customer_id: userId,
          period: targetPeriod,
          meter_id: this.meterId,
          usage: {
            count: usage.usage_count,
            unit: this.billingUnit,
            billing_cycle: this.billingCycle
          },
          events: this.getUserEvents(userId, targetPeriod),
          estimated_amount: this.calculateEstimatedAmount(usage.usage_count),
          last_updated: usage.last_updated
        };
      }

      // Real API call to get usage data
      const response = await this.axiosInstance.get(`/usage/customers/${userId}/meters/${this.meterId}`, {
        params: { period: targetPeriod }
      });

      return response.data;

    } catch (error) {
      console.error('Error fetching customer usage:', error.response?.data || error.message);
      throw new Error('Failed to fetch customer usage');
    }
  }

  /**
   * Get user events for a specific period
   */
  getUserEvents(userId, period) {
    const events = Array.from(this.usageEvents.values())
      .filter(event => 
        event.customer_id === userId && 
        event.timestamp.startsWith(period)
      )
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return events.map(event => ({
      event_id: event.event_id,
      timestamp: event.timestamp,
      service_type: event.properties.service_type,
      urgency: event.properties.urgency,
      booking_id: event.properties.booking_id,
      quantity: event.properties.quantity
    }));
  }

  /**
   * Calculate estimated amount based on usage count
   * This is a demo calculation - replace with your actual pricing logic
   */
  calculateEstimatedAmount(usageCount) {
    const basePrice = 50; // ₹50 per service
    const urgencyMultiplier = 1.2; // 20% extra for urgent services
    
    return {
      base_amount: usageCount * basePrice,
      estimated_total: Math.round(usageCount * basePrice * urgencyMultiplier),
      currency: 'INR',
      per_unit_price: basePrice,
      billing_unit: this.billingUnit
    };
  }

  /**
   * Generate invoice for customer (simulated for demo)
   */
  async generateInvoice(userId, period = null) {
    try {
      const targetPeriod = period || new Date().toISOString().slice(0, 7);
      const usage = await this.getCustomerUsage(userId, targetPeriod);
      
      const invoiceId = uuidv4();
      const invoice = {
        invoice_id: invoiceId,
        customer_id: userId,
        period: targetPeriod,
        billing_cycle: this.billingCycle,
        usage_summary: usage.usage,
        amount: usage.estimated_amount,
        status: 'pending',
        due_date: this.calculateDueDate(),
        created_at: new Date().toISOString(),
        line_items: [
          {
            description: `Emergency Services (${targetPeriod})`,
            quantity: usage.usage.count,
            unit_price: usage.estimated_amount.per_unit_price,
            amount: usage.estimated_amount.estimated_total,
            unit: this.billingUnit
          }
        ]
      };

      if (this.isTestMode) {
        this.invoices.set(invoiceId, invoice);
        console.log(`🧾 Generated invoice: ${invoiceId} for user: ${userId} (${targetPeriod})`);
        return invoice;
      }

      // Real API call to generate invoice
      const response = await this.axiosInstance.post('/billing/invoices', {
        customer_id: userId,
        period: targetPeriod,
        meter_id: this.meterId
      });

      this.invoices.set(invoiceId, response.data);
      return response.data;

    } catch (error) {
      console.error('Error generating invoice:', error.response?.data || error.message);
      throw new Error('Failed to generate invoice');
    }
  }

  /**
   * Calculate due date (30 days from invoice generation)
   */
  calculateDueDate() {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);
    return dueDate.toISOString();
  }

  /**
   * Get customer invoices
   */
  async getCustomerInvoices(userId, options = {}) {
    try {
      const { status, limit = 10, offset = 0 } = options;

      if (this.isTestMode) {
        let invoices = Array.from(this.invoices.values())
          .filter(invoice => invoice.customer_id === userId);

        if (status) {
          invoices = invoices.filter(invoice => invoice.status === status);
        }

        invoices.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        return {
          invoices: invoices.slice(offset, offset + limit),
          total: invoices.length,
          has_more: invoices.length > offset + limit
        };
      }

      // Real API call
      const response = await this.axiosInstance.get(`/billing/customers/${userId}/invoices`, {
        params: { status, limit, offset }
      });

      return response.data;

    } catch (error) {
      console.error('Error fetching customer invoices:', error.response?.data || error.message);
      throw new Error('Failed to fetch customer invoices');
    }
  }

  /**
   * Get admin usage overview (all customers)
   */
  async getAdminUsageOverview(period = null) {
    try {
      const targetPeriod = period || new Date().toISOString().slice(0, 7);

      if (this.isTestMode) {
        const overview = {
          period: targetPeriod,
          total_customers: new Set(Array.from(this.usageEvents.values()).map(e => e.customer_id)).size,
          total_events: Array.from(this.usageEvents.values()).filter(e => e.timestamp.startsWith(targetPeriod)).length,
          total_revenue: 0,
          service_breakdown: {},
          top_customers: []
        };

        // Calculate service breakdown
        const periodEvents = Array.from(this.usageEvents.values())
          .filter(e => e.timestamp.startsWith(targetPeriod));

        periodEvents.forEach(event => {
          const serviceType = event.properties.service_type;
          overview.service_breakdown[serviceType] = (overview.service_breakdown[serviceType] || 0) + 1;
        });

        // Calculate estimated revenue
        overview.total_revenue = periodEvents.length * 50; // ₹50 per service

        // Get top customers
        const customerUsage = {};
        periodEvents.forEach(event => {
          customerUsage[event.customer_id] = (customerUsage[event.customer_id] || 0) + 1;
        });

        overview.top_customers = Object.entries(customerUsage)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 10)
          .map(([customerId, count]) => ({
            customer_id: customerId,
            usage_count: count,
            estimated_amount: count * 50
          }));

        return overview;
      }

      // Real API call
      const response = await this.axiosInstance.get('/usage/admin/overview', {
        params: { period: targetPeriod, meter_id: this.meterId }
      });

      return response.data;

    } catch (error) {
      console.error('Error fetching admin usage overview:', error.response?.data || error.message);
      throw new Error('Failed to fetch admin usage overview');
    }
  }

  /**
   * Process webhook for billing events
   */
  async processUsageBillingWebhook(webhookData) {
    try {
      const { type, data } = webhookData;

      switch (type) {
        case 'invoice.generated':
          console.log(`🧾 Invoice generated: ${data.object.id}`);
          // Handle invoice generation
          break;

        case 'invoice.payment_succeeded':
          console.log(`💰 Invoice paid: ${data.object.id}`);
          // Handle successful payment
          break;

        case 'invoice.payment_failed':
          console.log(`❌ Invoice payment failed: ${data.object.id}`);
          // Handle failed payment
          break;

        case 'usage.meter.updated':
          console.log(`📊 Usage meter updated: ${data.object.meter_id}`);
          // Handle meter updates
          break;

        default:
          console.log(`🔔 Unhandled webhook type: ${type}`);
      }

      return { success: true, processed: true };

    } catch (error) {
      console.error('Error processing usage billing webhook:', error.message);
      throw new Error('Failed to process usage billing webhook');
    }
  }

  /**
   * Get service status and statistics
   */
  getServiceStatus() {
    return {
      initialized: true,
      test_mode: this.isTestMode,
      meter_id: this.meterId,
      billing_cycle: this.billingCycle,
      billing_unit: this.billingUnit,
      total_events: this.usageEvents.size,
      total_customers: new Set(Array.from(this.usageEvents.values()).map(e => e.customer_id)).size,
      total_invoices: this.invoices.size,
      last_activity: new Date().toISOString()
    };
  }

  /**
   * Retry failed usage events (for reliability)
   */
  async retryFailedEvents() {
    // Implementation for retrying failed events
    // This would typically query failed events from database and retry them
    console.log('🔄 Retrying failed usage events...');
    return { retried: 0, success: 0, failed: 0 };
  }
}

module.exports = DodoUsageBillingService;