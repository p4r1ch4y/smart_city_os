/**
 * Blockchain Service for Smart City OS
 * Handles transparent logging and data integrity verification
 */

const CityDataLogger = require('../../blockchain/smart-contracts/city-data-logger');

class BlockchainService {
  constructor() {
    this.logger = new CityDataLogger('devnet');
    this.isInitialized = false;
    this.transactionQueue = [];
    this.processingQueue = false;
  }

  async initialize() {
    try {
      // In a real implementation, you would load the keypair from secure storage
      // For demo purposes, we'll simulate initialization
      console.log('Initializing blockchain service...');
      this.isInitialized = true;
      
      // Start processing queued transactions
      this.startQueueProcessor();
      
      console.log('Blockchain service initialized successfully');
      return { success: true };
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Log sensor data to blockchain for transparency
   */
  async logSensorData(sensorData) {
    try {
      const { id, type, value, timestamp, location } = sensorData;
      
      const logData = {
        sensorId: id,
        sensorType: type,
        value,
        timestamp,
        location,
        hash: this.generateDataHash(sensorData)
      };

      if (this.isInitialized) {
        const result = await this.logger.logSensorData(id, logData, timestamp);
        
        if (result.success) {
          console.log(`Sensor data logged to blockchain: ${id}`);
          return {
            success: true,
            transactionId: result.signature,
            explorerUrl: result.explorerUrl,
            blockchainNetwork: 'solana-devnet'
          };
        } else {
          // Queue for retry if blockchain is temporarily unavailable
          this.queueTransaction('sensor', logData);
          return result;
        }
      } else {
        // Queue transaction if not initialized
        this.queueTransaction('sensor', logData);
        return {
          success: true,
          queued: true,
          message: 'Transaction queued for blockchain logging'
        };
      }
    } catch (error) {
      console.error('Sensor data logging error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log alert to blockchain for transparency
   */
  async logAlert(alertData) {
    try {
      const { id, type, severity, message, timestamp, sensorId } = alertData;
      
      const logData = {
        alertId: id,
        alertType: type,
        severity,
        message,
        timestamp,
        sensorId,
        hash: this.generateDataHash(alertData)
      };

      if (this.isInitialized) {
        const result = await this.logger.logAlert(id, logData, severity);
        
        if (result.success) {
          console.log(`Alert logged to blockchain: ${id}`);
          return {
            success: true,
            transactionId: result.signature,
            explorerUrl: result.explorerUrl,
            blockchainNetwork: 'solana-devnet'
          };
        } else {
          this.queueTransaction('alert', logData);
          return result;
        }
      } else {
        this.queueTransaction('alert', logData);
        return {
          success: true,
          queued: true,
          message: 'Alert queued for blockchain logging'
        };
      }
    } catch (error) {
      console.error('Alert logging error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log administrative action for transparency
   */
  async logAdminAction(actionData) {
    try {
      const { action, userId, details, timestamp } = actionData;
      
      const logData = {
        action,
        userId,
        details,
        timestamp: timestamp || Date.now(),
        hash: this.generateDataHash(actionData)
      };

      if (this.isInitialized) {
        const result = await this.logger.logAdminAction(action, userId, details);
        
        if (result.success) {
          console.log(`Admin action logged to blockchain: ${action}`);
          return {
            success: true,
            transactionId: result.signature,
            explorerUrl: result.explorerUrl,
            blockchainNetwork: 'solana-devnet'
          };
        } else {
          this.queueTransaction('admin', logData);
          return result;
        }
      } else {
        this.queueTransaction('admin', logData);
        return {
          success: true,
          queued: true,
          message: 'Admin action queued for blockchain logging'
        };
      }
    } catch (error) {
      console.error('Admin action logging error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Verify data integrity using blockchain
   */
  async verifyDataIntegrity(dataHash, transactionId) {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Blockchain service not initialized'
        };
      }

      const result = await this.logger.verifyDataIntegrity(dataHash, transactionId);
      
      return {
        success: true,
        isValid: result.isValid,
        verificationDetails: result,
        blockchainNetwork: 'solana-devnet'
      };
    } catch (error) {
      console.error('Data verification error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get transparency report
   */
  async getTransparencyReport(timeRange = '24h') {
    try {
      if (!this.isInitialized) {
        return {
          success: false,
          error: 'Blockchain service not initialized'
        };
      }

      const report = await this.logger.getTransparencyReport(timeRange);
      
      return {
        success: true,
        report: {
          ...report,
          queuedTransactions: this.transactionQueue.length,
          serviceStatus: 'operational'
        }
      };
    } catch (error) {
      console.error('Transparency report error:', error);
      return {
        success: false,
        error: error.message,
        fallbackReport: {
          totalTransactions: 0,
          queuedTransactions: this.transactionQueue.length,
          serviceStatus: 'error'
        }
      };
    }
  }

  /**
   * Get blockchain service status
   */
  getServiceStatus() {
    return {
      initialized: this.isInitialized,
      queuedTransactions: this.transactionQueue.length,
      processingQueue: this.processingQueue,
      network: 'solana-devnet',
      lastActivity: new Date().toISOString()
    };
  }

  // Private methods
  queueTransaction(type, data) {
    this.transactionQueue.push({
      type,
      data,
      timestamp: Date.now(),
      retries: 0
    });

    // Limit queue size
    if (this.transactionQueue.length > 1000) {
      this.transactionQueue.shift();
    }
  }

  async startQueueProcessor() {
    if (this.processingQueue) return;
    
    this.processingQueue = true;
    
    const processQueue = async () => {
      if (this.transactionQueue.length === 0) {
        setTimeout(processQueue, 5000); // Check every 5 seconds
        return;
      }

      const transaction = this.transactionQueue.shift();
      
      try {
        let result;
        switch (transaction.type) {
          case 'sensor':
            result = await this.logger.logSensorData(
              transaction.data.sensorId,
              transaction.data,
              transaction.data.timestamp
            );
            break;
          case 'alert':
            result = await this.logger.logAlert(
              transaction.data.alertId,
              transaction.data,
              transaction.data.severity
            );
            break;
          case 'admin':
            result = await this.logger.logAdminAction(
              transaction.data.action,
              transaction.data.userId,
              transaction.data.details
            );
            break;
        }

        if (!result.success && transaction.retries < 3) {
          transaction.retries++;
          this.transactionQueue.unshift(transaction); // Retry
        }
      } catch (error) {
        console.error('Queue processing error:', error);
        
        if (transaction.retries < 3) {
          transaction.retries++;
          this.transactionQueue.unshift(transaction);
        }
      }

      setTimeout(processQueue, 1000); // Process next transaction after 1 second
    };

    processQueue();
  }

  generateDataHash(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }
}

// Singleton instance
const blockchainService = new BlockchainService();

module.exports = blockchainService;
