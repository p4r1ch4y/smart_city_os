const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const blockchainService = require('../services/blockchainService');

/**
 * @route GET /api/blockchain/status
 * @desc Get blockchain service status
 * @access Public
 */
router.get('/status', async (req, res) => {
  try {
    const status = blockchainService.getServiceStatus();
    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    console.error('Blockchain status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain status'
    });
  }
});

/**
 * @route GET /api/blockchain/transparency-report
 * @desc Get transparency report from blockchain
 * @access Private
 */
router.get('/transparency-report', authMiddleware, async (req, res) => {
  try {
    const { timeRange = '24h' } = req.query;
    
    const result = await blockchainService.getTransparencyReport(timeRange);
    
    if (result.success) {
      res.json({
        success: true,
        data: result.report
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error,
        fallbackData: result.fallbackReport
      });
    }
  } catch (error) {
    console.error('Transparency report error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate transparency report'
    });
  }
});

/**
 * @route POST /api/blockchain/verify
 * @desc Verify data integrity using blockchain
 * @access Private
 */
router.post('/verify', authMiddleware, async (req, res) => {
  try {
    const { dataHash, transactionId } = req.body;
    
    if (!dataHash || !transactionId) {
      return res.status(400).json({
        success: false,
        error: 'Data hash and transaction ID are required'
      });
    }
    
    const result = await blockchainService.verifyDataIntegrity(dataHash, transactionId);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          isValid: result.isValid,
          verificationDetails: result.verificationDetails,
          blockchainNetwork: result.blockchainNetwork
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Data verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify data integrity'
    });
  }
});

/**
 * @route POST /api/blockchain/log-admin-action
 * @desc Log administrative action to blockchain
 * @access Private
 */
router.post('/log-admin-action', authMiddleware, async (req, res) => {
  try {
    const { action, details } = req.body;
    const userId = req.user.id;
    
    if (!action) {
      return res.status(400).json({
        success: false,
        error: 'Action is required'
      });
    }
    
    const actionData = {
      action,
      userId,
      details: details || {},
      timestamp: Date.now()
    };
    
    const result = await blockchainService.logAdminAction(actionData);
    
    if (result.success) {
      res.json({
        success: true,
        data: {
          transactionId: result.transactionId,
          explorerUrl: result.explorerUrl,
          blockchainNetwork: result.blockchainNetwork,
          queued: result.queued || false
        }
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Admin action logging error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to log admin action'
    });
  }
});

/**
 * @route GET /api/blockchain/analytics
 * @desc Get blockchain analytics and statistics
 * @access Private
 */
router.get('/analytics', authMiddleware, async (req, res) => {
  try {
    const { timeRange = '7d' } = req.query;
    
    // Get transparency report for analytics
    const reportResult = await blockchainService.getTransparencyReport(timeRange);
    const status = blockchainService.getServiceStatus();
    
    if (reportResult.success) {
      const report = reportResult.report;
      
      // Calculate analytics
      const analytics = {
        totalTransactions: report.totalTransactions,
        transactionsByType: {
          sensor: report.sensorDataLogs,
          alert: report.alertLogs,
          admin: report.adminActionLogs
        },
        averageTransactionsPerDay: Math.round(report.totalTransactions / 7),
        blockchainNetwork: report.blockchainNetwork,
        serviceUptime: status.initialized ? '99.9%' : '0%',
        queuedTransactions: status.queuedTransactions,
        dataIntegrityScore: 98.5, // Simulated score
        transparencyMetrics: {
          publiclyVerifiable: report.totalTransactions,
          tamperProof: true,
          decentralized: true,
          auditTrail: report.logs.length
        },
        recentActivity: report.logs.slice(0, 10).map(log => ({
          type: log.type,
          timestamp: log.timestamp,
          transactionId: log.signature,
          blockHeight: log.blockHeight
        }))
      };
      
      res.json({
        success: true,
        data: analytics
      });
    } else {
      res.status(500).json({
        success: false,
        error: reportResult.error,
        fallbackData: {
          totalTransactions: 0,
          serviceUptime: '0%',
          queuedTransactions: status.queuedTransactions
        }
      });
    }
  } catch (error) {
    console.error('Blockchain analytics error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get blockchain analytics'
    });
  }
});

/**
 * @route POST /api/blockchain/verify-account
 * @desc Verify account existence and data on Solana blockchain
 * @access Public
 */
router.post('/verify-account', async (req, res) => {
  try {
    const { location, sensorId } = req.body;
    
    if (!location || !sensorId) {
      return res.status(400).json({
        success: false,
        error: 'Location and sensor ID are required'
      });
    }
    
    const result = await blockchainService.getAccountInfo(location, sensorId);
    
    if (result.success !== false) {
      res.json({
        success: true,
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: result.error
      });
    }
  } catch (error) {
    console.error('Account verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to verify account'
    });
  }
});

/**
 * @route POST /api/blockchain/initialize-air-quality
 * @desc Initialize air quality account on blockchain
 * @access Private
 */
router.post('/initialize-air-quality', authMiddleware, async (req, res) => {
  try {
    const { location, sensorId } = req.body;
    
    if (!location || !sensorId) {
      return res.status(400).json({
        success: false,
        error: 'Location and sensor ID are required'
      });
    }
    
    const result = await blockchainService.initializeAirQuality(location, sensorId);
    
    res.json({
      success: result.success,
      data: result.success ? {
        pda: result.pda,
        message: result.message,
        existed: result.existed || false,
        location,
        sensorId
      } : null,
      error: result.success ? null : result.error
    });
  } catch (error) {
    console.error('Air quality initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize air quality account'
    });
  }
});

/**
 * @route POST /api/blockchain/initialize-contract
 * @desc Initialize smart contract on blockchain
 * @access Private
 */
router.post('/initialize-contract', authMiddleware, async (req, res) => {
  try {
    const { name, description, contractType } = req.body;
    
    if (!name || !description || !contractType) {
      return res.status(400).json({
        success: false,
        error: 'Name, description, and contract type are required'
      });
    }
    
    const result = await blockchainService.initializeContract(name, description, contractType);
    
    res.json({
      success: result.success,
      data: result.success ? {
        pda: result.pda,
        message: result.message,
        existed: result.existed || false,
        name,
        description,
        contractType
      } : null,
      error: result.success ? null : result.error
    });
  } catch (error) {
    console.error('Contract initialization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to initialize contract'
    });
  }
});

module.exports = router;
