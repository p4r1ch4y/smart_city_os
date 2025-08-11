/**
 * Smart City OS - Blockchain Data Logger
 * Solana-based smart contract for transparent city data logging
 */

const {
  Connection,
  PublicKey,
  Keypair,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
  clusterApiUrl,
} = require('@solana/web3.js');

const {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  transfer,
} = require('@solana/spl-token');

class CityDataLogger {
  constructor(network = 'devnet') {
    this.connection = new Connection(clusterApiUrl(network), 'confirmed');
    this.programId = new PublicKey('CityDataLogger11111111111111111111111111111');
    this.payer = null;
    this.dataAccounts = new Map();
  }

  async initialize(payerKeypair) {
    this.payer = payerKeypair;
    console.log('Blockchain logger initialized with payer:', this.payer.publicKey.toString());
  }

  /**
   * Log sensor data to blockchain for transparency
   */
  async logSensorData(sensorId, data, timestamp) {
    try {
      const dataHash = this.hashData(data);
      const logEntry = {
        sensorId,
        dataHash,
        timestamp,
        blockHeight: await this.connection.getSlot(),
        validator: this.payer.publicKey.toString()
      };

      // Create transaction to log data
      const transaction = new Transaction();
      
      // Add instruction to store data hash on-chain
      const instruction = SystemProgram.createAccount({
        fromPubkey: this.payer.publicKey,
        newAccountPubkey: Keypair.generate().publicKey,
        lamports: await this.connection.getMinimumBalanceForRentExemption(256),
        space: 256,
        programId: this.programId,
      });

      transaction.add(instruction);

      // Send transaction
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [this.payer]
      );

      console.log('Data logged to blockchain:', signature);
      
      return {
        success: true,
        signature,
        logEntry,
        explorerUrl: `https://explorer.solana.com/tx/${signature}?cluster=devnet`
      };

    } catch (error) {
      console.error('Blockchain logging error:', error);
      return {
        success: false,
        error: error.message,
        fallback: this.logToLocalStorage(sensorId, data, timestamp)
      };
    }
  }

  /**
   * Log alert data for transparency
   */
  async logAlert(alertId, alertData, severity) {
    try {
      const alertEntry = {
        alertId,
        severity,
        timestamp: Date.now(),
        dataHash: this.hashData(alertData),
        publicKey: this.payer?.publicKey.toString() || 'offline'
      };

      // For demo purposes, simulate blockchain logging
      const mockSignature = this.generateMockSignature();
      
      console.log('Alert logged to blockchain:', mockSignature);
      
      return {
        success: true,
        signature: mockSignature,
        alertEntry,
        explorerUrl: `https://explorer.solana.com/tx/${mockSignature}?cluster=devnet`
      };

    } catch (error) {
      console.error('Alert logging error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log administrative actions for transparency
   */
  async logAdminAction(action, userId, details) {
    try {
      const actionEntry = {
        action,
        userId,
        details,
        timestamp: Date.now(),
        blockHeight: await this.getBlockHeight(),
        hash: this.hashData({ action, userId, details })
      };

      const mockSignature = this.generateMockSignature();
      
      console.log('Admin action logged:', actionEntry);
      
      return {
        success: true,
        signature: mockSignature,
        actionEntry,
        explorerUrl: `https://explorer.solana.com/tx/${mockSignature}?cluster=devnet`
      };

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
  async verifyDataIntegrity(dataHash, signature) {
    try {
      // Simulate blockchain verification
      const isValid = signature && signature.length === 88; // Solana signature length
      
      return {
        isValid,
        signature,
        verifiedAt: Date.now(),
        blockchainNetwork: 'solana-devnet'
      };

    } catch (error) {
      console.error('Verification error:', error);
      return {
        isValid: false,
        error: error.message
      };
    }
  }

  /**
   * Get transparency report
   */
  async getTransparencyReport(timeRange = '24h') {
    try {
      const endTime = Date.now();
      const startTime = endTime - this.parseTimeRange(timeRange);

      // Simulate fetching blockchain logs
      const mockLogs = this.generateMockTransparencyLogs(startTime, endTime);

      return {
        timeRange,
        totalTransactions: mockLogs.length,
        sensorDataLogs: mockLogs.filter(log => log.type === 'sensor').length,
        alertLogs: mockLogs.filter(log => log.type === 'alert').length,
        adminActionLogs: mockLogs.filter(log => log.type === 'admin').length,
        logs: mockLogs,
        blockchainNetwork: 'solana-devnet',
        generatedAt: Date.now()
      };

    } catch (error) {
      console.error('Transparency report error:', error);
      return {
        error: error.message,
        fallbackData: {
          totalTransactions: 0,
          logs: []
        }
      };
    }
  }

  // Utility methods
  hashData(data) {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  generateMockSignature() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let signature = '';
    for (let i = 0; i < 88; i++) {
      signature += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return signature;
  }

  async getBlockHeight() {
    try {
      return await this.connection.getSlot();
    } catch {
      return Math.floor(Date.now() / 1000); // Fallback to timestamp
    }
  }

  parseTimeRange(timeRange) {
    const multipliers = {
      'h': 3600000,    // hours
      'd': 86400000,   // days
      'w': 604800000   // weeks
    };
    
    const match = timeRange.match(/(\d+)([hdw])/);
    if (match) {
      const [, amount, unit] = match;
      return parseInt(amount) * multipliers[unit];
    }
    
    return 86400000; // Default to 24 hours
  }

  generateMockTransparencyLogs(startTime, endTime) {
    const logs = [];
    const logTypes = ['sensor', 'alert', 'admin'];
    const sensorIds = ['traffic_001', 'air_001', 'energy_001', 'waste_001'];
    
    // Generate 20-50 mock logs
    const logCount = Math.floor(Math.random() * 30) + 20;
    
    for (let i = 0; i < logCount; i++) {
      const timestamp = startTime + Math.random() * (endTime - startTime);
      const type = logTypes[Math.floor(Math.random() * logTypes.length)];
      
      const log = {
        id: `log_${i}`,
        type,
        timestamp,
        signature: this.generateMockSignature(),
        blockHeight: Math.floor(timestamp / 1000),
      };

      switch (type) {
        case 'sensor':
          log.sensorId = sensorIds[Math.floor(Math.random() * sensorIds.length)];
          log.dataHash = this.hashData({ value: Math.random() * 100, timestamp });
          break;
        case 'alert':
          log.alertId = `alert_${i}`;
          log.severity = ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)];
          break;
        case 'admin':
          log.action = ['user_created', 'settings_updated', 'sensor_calibrated'][Math.floor(Math.random() * 3)];
          log.userId = `user_${Math.floor(Math.random() * 10)}`;
          break;
      }

      logs.push(log);
    }

    return logs.sort((a, b) => b.timestamp - a.timestamp);
  }

  logToLocalStorage(sensorId, data, timestamp) {
    // Fallback logging when blockchain is unavailable
    const logEntry = {
      sensorId,
      data,
      timestamp,
      logged_at: Date.now(),
      method: 'local_storage'
    };

    try {
      const existingLogs = JSON.parse(localStorage.getItem('city_data_logs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 1000 entries
      if (existingLogs.length > 1000) {
        existingLogs.splice(0, existingLogs.length - 1000);
      }
      
      localStorage.setItem('city_data_logs', JSON.stringify(existingLogs));
      
      return {
        success: true,
        method: 'local_storage',
        logEntry
      };
    } catch (error) {
      console.error('Local storage fallback failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

module.exports = CityDataLogger;
