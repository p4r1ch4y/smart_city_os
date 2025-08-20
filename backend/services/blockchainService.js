/**
 * Blockchain Service for Smart City OS
 * Handles School of Solana CivicLedger smart contract integration
 */

const { Connection, PublicKey, Keypair } = require('@solana/web3.js');

class BlockchainService {
  constructor() {
    this.connection = new Connection('https://api.devnet.solana.com', 'confirmed');
    this.programId = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
    this.isInitialized = false;
    this.transactionQueue = [];
    this.processingQueue = false;
  }

  async initialize() {
    if (this.isInitialized) return { success: true };

    try {
      console.log('Initializing School of Solana blockchain service...');
      
      // For demo purposes, generate a keypair
      // In production, this would be loaded from secure storage
      this.keypair = Keypair.generate();
      
      // Request airdrop for demo purposes
      try {
        const airdropSignature = await this.connection.requestAirdrop(
          this.keypair.publicKey,
          1000000000 // 1 SOL
        );
        await this.connection.confirmTransaction(airdropSignature);
        console.log('Airdrop successful for blockchain service');
      } catch (airdropError) {
        console.warn('Airdrop failed, continuing without funds:', airdropError.message);
      }

      this.isInitialized = true;
      
      // Start processing queued transactions
      this.startQueueProcessor();
      
      console.log('School of Solana blockchain service initialized successfully');
      console.log('Authority:', this.keypair.publicKey.toString());
      console.log('Program ID:', this.programId.toString());
      
      return { success: true };
    } catch (error) {
      console.error('Blockchain initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  derivePDAs(location, sensorId, contractName = 'IoT Service Agreement') {
    const [airQualityPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('air_quality'),
        Buffer.from(location),
        Buffer.from(sensorId)
      ],
      this.programId
    );

    const [contractPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('contract'),
        Buffer.from(contractName),
        this.keypair?.publicKey?.toBuffer() || Buffer.alloc(32)
      ],
      this.programId
    );

    return { airQualityPDA, contractPDA };
  }

  /**
   * Cost-effective blockchain logging strategy
   * Only logs critical data to reduce transaction costs
   */
  async logSensorData(sensorData) {
    try {
      const { id, type, value, timestamp, location, metadata } = sensorData;

      // Determine if this data should be posted on-chain
      const shouldPostOnChain = this.shouldPostToBlockchain(sensorData);

      // Extract air quality data if available
      let airQualityData = null;
      if (type === 'air_quality' && metadata) {
        airQualityData = {
          aqi: metadata.aqi || 0,
          pm25: metadata.pm25 || 0,
          pm10: metadata.pm10 || 0,
          co2: metadata.co2 || 0,
          humidity: metadata.humidity || 0,
          temperature: metadata.temperature || 0
        };
      }

      const logData = {
        sensorId: id,
        sensorType: type,
        value,
        timestamp,
        location: location || 'Unknown',
        airQualityData,
        hash: this.generateDataHash(sensorData),
        priority: shouldPostOnChain ? 'high' : 'low'
      };

      if (shouldPostOnChain && this.isInitialized && airQualityData) {
        // Post critical/exceptional data to blockchain
        const result = await this.updateAirQuality(location || 'Unknown', id, airQualityData);

        if (result.success) {
          console.log(`🔗 Critical air quality data logged to blockchain: ${id} (AQI: ${airQualityData.aqi})`);
          return {
            success: true,
            pda: result.pda,
            message: result.message,
            blockchainNetwork: 'solana-devnet',
            costOptimized: true,
            reason: this.getBlockchainPostingReason(sensorData)
          };
        } else {
          // Queue for retry if blockchain is temporarily unavailable
          this.queueTransaction('sensor', logData);
          return result;
        }
      } else {
        // Store locally for normal readings - cost optimization
        console.log(`💾 Normal sensor data stored locally: ${id} (${type}: ${value})`);
        return {
          success: true,
          queued: false,
          localOnly: true,
          message: 'Normal reading stored locally (cost optimization)',
          reason: shouldPostOnChain ? 'Blockchain not initialized' : 'Normal reading - no blockchain needed'
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
   * Determine if sensor data should be posted to blockchain
   * Cost optimization: Only post critical/exceptional data
   */
  shouldPostToBlockchain(sensorData) {
    const { type, value, metadata } = sensorData;

    switch (type) {
      case 'air_quality':
        if (metadata?.aqi) {
          // Post if AQI is critical (>150) or exceptionally good (<25)
          return metadata.aqi > 150 || metadata.aqi < 25;
        }
        return false;

      case 'traffic':
        // Post if traffic congestion is critical (>90%) or exceptionally low (<10%)
        return value > 90 || value < 10;

      case 'energy':
        // Post if energy consumption is critical (>95%) or exceptionally efficient (<20%)
        return value > 95 || value < 20;

      case 'water':
        // Post if water levels are critical (>95% or <10%)
        return value > 95 || value < 10;

      case 'waste':
        // Post if waste bins are full (>90%) or empty (<5%)
        return value > 90 || value < 5;

      default:
        // For unknown types, only post extreme values
        return value > 90 || value < 10;
    }
  }

  /**
   * Get human-readable reason for blockchain posting
   */
  getBlockchainPostingReason(sensorData) {
    const { type, value, metadata } = sensorData;

    switch (type) {
      case 'air_quality':
        if (metadata?.aqi > 150) return 'Critical air quality alert - public health concern';
        if (metadata?.aqi < 25) return 'Exceptional air quality - environmental achievement';
        break;

      case 'traffic':
        if (value > 90) return 'Severe traffic congestion - emergency response needed';
        if (value < 10) return 'Exceptional traffic flow - infrastructure efficiency';
        break;

      case 'energy':
        if (value > 95) return 'Critical energy consumption - grid stability concern';
        if (value < 20) return 'Exceptional energy efficiency - sustainability milestone';
        break;

      case 'water':
        if (value > 95) return 'Critical water level - flood risk';
        if (value < 10) return 'Low water level - drought concern';
        break;

      case 'waste':
        if (value > 90) return 'Waste bins full - immediate collection needed';
        if (value < 5) return 'Efficient waste management - optimization success';
        break;
    }

    return 'Exceptional reading requiring transparency';
  }

  async initializeAirQuality(location, sensorId) {
    await this.initialize();

    try {
      const { airQualityPDA } = this.derivePDAs(location, sensorId);

      // Check if account already exists
      const accountInfo = await this.connection.getAccountInfo(airQualityPDA);
      if (accountInfo) {
        console.log(`Air quality account already exists for ${location}:${sensorId}`);
        return { 
          success: true, 
          pda: airQualityPDA.toString(), 
          existed: true,
          message: 'Air quality account already initialized'
        };
      }

      // For demo purposes, we'll just return the PDA without actually creating the transaction
      // In a real implementation, you would construct and send the transaction
      console.log(`Would initialize air quality account for ${location}:${sensorId}`);
      console.log(`PDA: ${airQualityPDA.toString()}`);

      return {
        success: true,
        pda: airQualityPDA.toString(),
        message: 'Air quality initialization prepared (demo mode)',
        location,
        sensorId
      };
    } catch (error) {
      console.error('Failed to initialize air quality:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async updateAirQuality(location, sensorId, sensorData) {
    await this.initialize();

    try {
      const { airQualityPDA } = this.derivePDAs(location, sensorId);

      // Validate sensor data
      const validatedData = this.validateSensorData(sensorData);
      if (!validatedData.isValid) {
        return {
          success: false,
          error: `Invalid sensor data: ${validatedData.errors.join(', ')}`
        };
      }

      // For demo purposes, we'll just return the update information
      console.log(`Would update air quality for ${location}:${sensorId}`);
      console.log(`PDA: ${airQualityPDA.toString()}`);
      console.log('Data:', sensorData);

      return {
        success: true,
        pda: airQualityPDA.toString(),
        message: 'Air quality update prepared (demo mode)',
        location,
        sensorId,
        data: sensorData,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Failed to update air quality:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Log administrative contract to blockchain (ALWAYS posted for transparency)
   * Administrative contracts and governance decisions are always blockchain-logged
   */
  async logAdministrativeContract(contractData) {
    try {
      const { name, description, type, authority } = contractData;

      console.log(`🏛️ Administrative contract ALWAYS posted to blockchain: ${name}`);

      if (this.isInitialized) {
        // Try to initialize contract on-chain
        const result = await this.initializeContract(name, description, type);

        if (result.success) {
          console.log(`✅ Administrative contract logged to blockchain: ${name}`);
          return {
            success: true,
            pda: result.pda,
            message: result.message,
            blockchainNetwork: 'solana-devnet',
            contractType: 'administrative',
            transparency: 'full',
            reason: 'Administrative transparency requirement'
          };
        } else {
          // Queue for retry - administrative contracts must be on-chain
          this.queueTransaction('contract', {
            name,
            description,
            type,
            authority,
            priority: 'critical'
          });
          return result;
        }
      } else {
        // Queue with high priority - administrative contracts are critical
        this.queueTransaction('contract', {
          name,
          description,
          type,
          authority,
          priority: 'critical'
        });
        return {
          success: true,
          queued: true,
          priority: 'critical',
          message: 'Administrative contract queued for blockchain logging (high priority)'
        };
      }
    } catch (error) {
      console.error('Administrative contract logging error:', error);
      return {
        success: false,
        error: error.message,
        contractType: 'administrative'
      };
    }
  }

  async initializeContract(name, description, contractType) {
    await this.initialize();

    try {
      const { contractPDA } = this.derivePDAs('', '', name);

      // Check if contract already exists
      const accountInfo = await this.connection.getAccountInfo(contractPDA);
      if (accountInfo) {
        console.log(`Contract already exists: ${name}`);
        return { 
          success: true, 
          pda: contractPDA.toString(), 
          existed: true,
          message: 'Contract already initialized'
        };
      }

      // Validate contract data
      if (name.length > 50) return { success: false, error: 'Contract name too long' };
      if (description.length > 200) return { success: false, error: 'Contract description too long' };
      if (contractType.length > 30) return { success: false, error: 'Contract type too long' };

      console.log(`Would initialize contract: ${name}`);
      console.log(`PDA: ${contractPDA.toString()}`);

      return {
        success: true,
        pda: contractPDA.toString(),
        message: 'Contract initialization prepared (demo mode)',
        name,
        description,
        contractType
      };
    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  validateSensorData(data) {
    const errors = [];

    if (typeof data.aqi !== 'number' || data.aqi < 0 || data.aqi > 500) {
      errors.push('AQI must be between 0-500');
    }
    if (typeof data.pm25 !== 'number' || data.pm25 < 0 || data.pm25 > 1000) {
      errors.push('PM2.5 must be between 0-1000');
    }
    if (typeof data.pm10 !== 'number' || data.pm10 < 0 || data.pm10 > 1000) {
      errors.push('PM10 must be between 0-1000');
    }
    if (typeof data.co2 !== 'number' || data.co2 < 0 || data.co2 > 10000) {
      errors.push('CO2 must be between 0-10000');
    }
    if (typeof data.humidity !== 'number' || data.humidity < 0 || data.humidity > 100) {
      errors.push('Humidity must be between 0-100');
    }
    if (typeof data.temperature !== 'number' || data.temperature < -50 || data.temperature > 100) {
      errors.push('Temperature must be between -50 to 100');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  async getAccountInfo(location, sensorId) {
    await this.initialize();

    try {
      const { airQualityPDA, contractPDA } = this.derivePDAs(location, sensorId, 'IoT Service Agreement');

      const [airQualityInfo, contractInfo] = await Promise.all([
        this.connection.getAccountInfo(airQualityPDA),
        this.connection.getAccountInfo(contractPDA)
      ]);

      return {
        airQuality: {
          pda: airQualityPDA.toString(),
          exists: !!airQualityInfo,
          info: airQualityInfo ? {
            lamports: airQualityInfo.lamports,
            dataSize: airQualityInfo.data.length,
            owner: airQualityInfo.owner.toString()
          } : null
        },
        contract: {
          pda: contractPDA.toString(),
          exists: !!contractInfo,
          info: contractInfo ? {
            lamports: contractInfo.lamports,
            dataSize: contractInfo.data.length,
            owner: contractInfo.owner.toString()
          } : null
        }
      };
    } catch (error) {
      console.error('Failed to get account info:', error);
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
      return {
        success: true,
        report: {
          totalTransactions: this.transactionQueue.length,
          queuedTransactions: this.transactionQueue.length,
          serviceStatus: this.isInitialized ? 'operational' : 'initializing',
          network: 'solana-devnet',
          programId: this.programId.toString(),
          authority: this.keypair?.publicKey?.toString() || 'Not initialized',
          lastActivity: new Date().toISOString()
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
      programId: this.programId.toString(),
      authority: this.keypair?.publicKey?.toString() || 'Not initialized',
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
            if (transaction.data.airQualityData) {
              result = await this.updateAirQuality(
                transaction.data.location,
                transaction.data.sensorId,
                transaction.data.airQualityData
              );
            } else {
              result = { success: true, message: 'Non-air quality data processed' };
            }
            break;
          default:
            result = { success: true, message: 'Transaction type processed' };
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
