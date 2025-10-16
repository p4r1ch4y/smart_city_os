/**
 * Health Check Utilities
 * Simple utilities to check if services are working properly
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || '/api';

export const healthCheck = {
  /**
   * Check if the backend API is responding
   */
  async checkBackendHealth() {
    try {
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          data: data
        };
      } else {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  },

  /**
   * Check if emergency services API is working
   */
  async checkEmergencyServicesAPI() {
    try {
      const response = await fetch(`${API_BASE_URL}/emergency-services/types`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          serviceTypes: data.data?.length || 0
        };
      } else {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  },

  /**
   * Check if billing API is working
   */
  async checkBillingAPI() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/emergency-services/billing/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.ok) {
        const data = await response.json();
        return {
          status: 'healthy',
          data: data.data
        };
      } else if (response.status === 401) {
        return {
          status: 'auth_required',
          error: 'Authentication required'
        };
      } else {
        return {
          status: 'unhealthy',
          error: `HTTP ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  },

  /**
   * Run all health checks
   */
  async runAllChecks() {
    const results = {
      timestamp: new Date().toISOString(),
      checks: {}
    };

    try {
      results.checks.backend = await this.checkBackendHealth();
      results.checks.emergencyServices = await this.checkEmergencyServicesAPI();
      results.checks.billing = await this.checkBillingAPI();
      
      // Overall health status
      const allHealthy = Object.values(results.checks).every(
        check => check.status === 'healthy' || check.status === 'auth_required'
      );
      
      results.overall = allHealthy ? 'healthy' : 'unhealthy';
      
      return results;
    } catch (error) {
      results.overall = 'error';
      results.error = error.message;
      return results;
    }
  }
};

export default healthCheck;