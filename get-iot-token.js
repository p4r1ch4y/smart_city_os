#!/usr/bin/env node

const axios = require('axios');

async function getIoTServiceToken() {
  try {
    const response = await axios.post('http://localhost:3000/api/auth/iot-service', {
      serviceKey: process.env.IOT_SERVICE_KEY || 'iot-service-key-2024'
    });

    console.log('IoT Service Token:', response.data.token);
    console.log('User Info:', response.data.user);
    
    // Save token to environment file for IoT simulation
    const fs = require('fs');
    const envContent = `IOT_AUTH_TOKEN=${response.data.token}\n`;
    fs.writeFileSync('iot-simulation/.env', envContent);
    console.log('Token saved to iot-simulation/.env');
    
    return response.data.token;
  } catch (error) {
    console.error('Failed to get IoT service token:', error.response?.data || error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  getIoTServiceToken();
}

module.exports = { getIoTServiceToken };
