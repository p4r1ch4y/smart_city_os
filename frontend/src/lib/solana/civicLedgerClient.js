import { PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { AnchorProvider, web3 } from '@coral-xyz/anchor';

/**
 * Civic Ledger Client
 * TypeScript/JavaScript client for interacting with the CivicLedger smart contract
 */
export class CivicLedgerClient {
  constructor(connection, wallet, programId = 'A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An') {
    this.connection = connection;
    this.wallet = wallet;
    this.programId = new PublicKey(programId);
    this.provider = null;
    this.program = null;
  }

  /**
   * Initialize the client with Anchor provider
   */
  async initialize() {
    if (!this.wallet?.publicKey) {
      throw new Error('Wallet not connected');
    }

    this.provider = new AnchorProvider(
      this.connection,
      this.wallet,
      { commitment: 'confirmed' }
    );

    // In a real implementation, you would load the IDL
    // For now, we'll create a minimal interface
    this.program = {
      programId: this.programId,
      provider: this.provider
    };

    return this;
  }

  /**
   * Derive Program Derived Addresses (PDAs)
   */
  derivePDAs(location, sensorId, contractType = 'IoT Service Agreement') {
    // Air Quality PDA
    const [airQualityPDA, airQualityBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('air_quality'),
        Buffer.from(location.slice(0, 32)),
        Buffer.from(sensorId.slice(0, 32))
      ],
      this.programId
    );

    // Contract PDA
    const [contractPDA, contractBump] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('contract'),
        Buffer.from(contractType.slice(0, 32)),
        this.wallet.publicKey.toBuffer()
      ],
      this.programId
    );

    return {
      airQuality: {
        address: airQualityPDA,
        bump: airQualityBump
      },
      contract: {
        address: contractPDA,
        bump: contractBump
      }
    };
  }

  /**
   * Initialize Air Quality Account
   */
  async initializeAirQuality(location, sensorId) {
    try {
      await this.initialize();

      const pdas = this.derivePDAs(location, sensorId);
      
      // Create instruction data (simplified for demo)
      const instructionData = Buffer.concat([
        Buffer.from([0]), // Instruction discriminator for initialize_air_quality
        this.serializeString(location),
        this.serializeString(sensorId)
      ]);

      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: pdas.airQuality.address, isSigner: false, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: this.programId,
        data: instructionData
      });

      const transaction = new Transaction().add(instruction);
      
      // In a real implementation, you would send this transaction
      console.log('Would initialize air quality account:', {
        location,
        sensorId,
        pda: pdas.airQuality.address.toString(),
        transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64')
      });

      return {
        success: true,
        pda: pdas.airQuality.address.toString(),
        bump: pdas.airQuality.bump,
        transaction
      };

    } catch (error) {
      console.error('Failed to initialize air quality:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update Air Quality Data
   */
  async updateAirQuality(location, sensorId, data) {
    try {
      await this.initialize();

      const pdas = this.derivePDAs(location, sensorId);
      
      // Validate data
      const validationResult = this.validateAirQualityData(data);
      if (!validationResult.isValid) {
        throw new Error(`Invalid data: ${validationResult.errors.join(', ')}`);
      }

      // Create instruction data
      const instructionData = Buffer.concat([
        Buffer.from([1]), // Instruction discriminator for update_air_quality
        this.serializeU16(data.aqi),
        this.serializeF32(data.pm25),
        this.serializeF32(data.pm10),
        this.serializeF32(data.co2),
        this.serializeF32(data.humidity),
        this.serializeF32(data.temperature)
      ]);

      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: pdas.airQuality.address, isSigner: false, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: false }
        ],
        programId: this.programId,
        data: instructionData
      });

      const transaction = new Transaction().add(instruction);

      console.log('Would update air quality data:', {
        location,
        sensorId,
        data,
        pda: pdas.airQuality.address.toString(),
        transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64')
      });

      return {
        success: true,
        pda: pdas.airQuality.address.toString(),
        data,
        transaction
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
   * Initialize Contract
   */
  async initializeContract(name, description, contractType) {
    try {
      await this.initialize();

      const pdas = this.derivePDAs('', '', contractType);
      
      // Validate contract data
      if (name.length > 50) throw new Error('Contract name too long');
      if (description.length > 200) throw new Error('Contract description too long');
      if (contractType.length > 30) throw new Error('Contract type too long');

      const instructionData = Buffer.concat([
        Buffer.from([2]), // Instruction discriminator for initialize_contract
        this.serializeString(name),
        this.serializeString(description),
        this.serializeString(contractType)
      ]);

      const instruction = new web3.TransactionInstruction({
        keys: [
          { pubkey: pdas.contract.address, isSigner: false, isWritable: true },
          { pubkey: this.wallet.publicKey, isSigner: true, isWritable: true },
          { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
        ],
        programId: this.programId,
        data: instructionData
      });

      const transaction = new Transaction().add(instruction);

      console.log('Would initialize contract:', {
        name,
        description,
        contractType,
        pda: pdas.contract.address.toString(),
        transaction: transaction.serialize({ requireAllSignatures: false }).toString('base64')
      });

      return {
        success: true,
        pda: pdas.contract.address.toString(),
        bump: pdas.contract.bump,
        transaction
      };

    } catch (error) {
      console.error('Failed to initialize contract:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get Account Info
   */
  async getAccountInfo(address) {
    try {
      const publicKey = new PublicKey(address);
      const accountInfo = await this.connection.getAccountInfo(publicKey);
      
      if (!accountInfo) {
        return {
          exists: false,
          address: address
        };
      }

      return {
        exists: true,
        address: address,
        lamports: accountInfo.lamports,
        dataSize: accountInfo.data.length,
        owner: accountInfo.owner.toString(),
        executable: accountInfo.executable,
        rentEpoch: accountInfo.rentEpoch
      };

    } catch (error) {
      console.error('Failed to get account info:', error);
      return {
        exists: false,
        address: address,
        error: error.message
      };
    }
  }

  /**
   * Submit Community Feedback (simulated)
   */
  async submitFeedback(contractId, message) {
    try {
      await this.initialize();

      // In a real implementation, this would create a PDA for feedback
      // and submit it to the blockchain
      
      const feedbackId = `feedback_${Date.now()}`;
      const timestamp = Math.floor(Date.now() / 1000);

      // Create a simple transaction to demonstrate wallet interaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: this.wallet.publicKey,
          toPubkey: this.wallet.publicKey, // Self-transfer for demo
          lamports: 1, // Minimal amount
        })
      );

      console.log('Would submit feedback:', {
        contractId,
        message: message.substring(0, 50) + '...',
        feedbackId,
        timestamp,
        author: this.wallet.publicKey.toString()
      });

      return {
        success: true,
        feedbackId,
        timestamp,
        transaction,
        author: this.wallet.publicKey.toString()
      };

    } catch (error) {
      console.error('Failed to submit feedback:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate Air Quality Data
   */
  validateAirQualityData(data) {
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

  /**
   * Get Network Information
   */
  async getNetworkInfo() {
    try {
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      const version = await this.connection.getVersion();

      return {
        currentSlot: slot,
        blockTime: blockTime ? new Date(blockTime * 1000) : null,
        version: version['solana-core'],
        cluster: this.connection.rpcEndpoint.includes('devnet') ? 'devnet' : 
                this.connection.rpcEndpoint.includes('testnet') ? 'testnet' : 'mainnet'
      };

    } catch (error) {
      console.error('Failed to get network info:', error);
      return null;
    }
  }

  // Utility methods for serialization
  serializeString(str) {
    const encoded = Buffer.from(str, 'utf8');
    const length = Buffer.alloc(4);
    length.writeUInt32LE(encoded.length, 0);
    return Buffer.concat([length, encoded]);
  }

  serializeU16(value) {
    const buffer = Buffer.alloc(2);
    buffer.writeUInt16LE(value, 0);
    return buffer;
  }

  serializeF32(value) {
    const buffer = Buffer.alloc(4);
    buffer.writeFloatLE(value, 0);
    return buffer;
  }
}

// Export utility functions
export const createCivicLedgerClient = (connection, wallet) => {
  return new CivicLedgerClient(connection, wallet);
};

export const deriveCivicPDAs = (location, sensorId, contractType = 'IoT Service Agreement', programId = 'A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An') => {
  const programPublicKey = new PublicKey(programId);
  
  const [airQualityPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('air_quality'),
      Buffer.from(location.slice(0, 32)),
      Buffer.from(sensorId.slice(0, 32))
    ],
    programPublicKey
  );

  const [contractPDA] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('contract'),
      Buffer.from(contractType.slice(0, 32)),
      // Note: In real usage, you'd need the authority's public key here
    ],
    programPublicKey
  );

  return {
    airQuality: airQualityPDA.toString(),
    contract: contractPDA.toString()
  };
};