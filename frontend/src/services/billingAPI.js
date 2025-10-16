/**
 * Billing API Service
 * Handles all billing and usage-related API calls
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

class BillingAPIService {
  constructor() {
    this.baseURL = `${API_BASE_URL}/emergency-services`;
  }

  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Handle API response
   */
  async handleResponse(response) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  /**
   * Get customer usage summary
   */
  async getUsageSummary(period = null) {
    const params = period ? `?period=${period}` : '';
    const response = await fetch(`${this.baseURL}/billing/usage${params}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Get customer invoices
   */
  async getInvoices(options = {}) {
    const { status, limit = 10, offset = 0 } = options;
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('offset', offset.toString());

    const response = await fetch(`${this.baseURL}/billing/invoices?${params}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Generate invoice for current period
   */
  async generateInvoice(period = null) {
    const response = await fetch(`${this.baseURL}/billing/generate-invoice`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ period })
    });
    return this.handleResponse(response);
  }

  /**
   * Get admin billing overview (admin only)
   */
  async getAdminOverview(period = null) {
    const params = period ? `?period=${period}` : '';
    const response = await fetch(`${this.baseURL}/admin/billing/overview${params}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Get billing service status (admin only)
   */
  async getBillingStatus() {
    const response = await fetch(`${this.baseURL}/billing/status`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Book emergency service (with usage tracking)
   */
  async bookEmergencyService(bookingData) {
    const response = await fetch(`${this.baseURL}/book`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return this.handleResponse(response);
  }

  /**
   * Get service types
   */
  async getServiceTypes() {
    const response = await fetch(`${this.baseURL}/types`);
    return this.handleResponse(response);
  }

  /**
   * Calculate service fee
   */
  async calculateFee(feeData) {
    const response = await fetch(`${this.baseURL}/calculate-fee`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feeData)
    });
    return this.handleResponse(response);
  }

  /**
   * Get user bookings
   */
  async getUserBookings(options = {}) {
    const { page = 1, limit = 10, status } = options;
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    if (status) params.append('status', status);

    const response = await fetch(`${this.baseURL}/bookings?${params}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Get specific booking details
   */
  async getBookingDetails(bookingId) {
    const response = await fetch(`${this.baseURL}/bookings/${bookingId}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(sessionId) {
    const response = await fetch(`${this.baseURL}/payment/${sessionId}/status`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }
}

// Create singleton instance
const billingAPI = new BillingAPIService();

// Export individual methods for easier imports
export const {
  getUsageSummary,
  getInvoices,
  generateInvoice,
  getAdminOverview,
  getBillingStatus,
  bookEmergencyService,
  getServiceTypes,
  calculateFee,
  getUserBookings,
  getBookingDetails,
  getPaymentStatus
} = billingAPI;

// Export the service instance
export default billingAPI;