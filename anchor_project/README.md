# CivicLedger Smart Contract

A comprehensive Solana smart contract built with Anchor for civic transparency and IoT data management in smart cities.

## 🏛️ Overview

CivicLedger is a blockchain-based solution for transparent civic governance, featuring:

- **Air Quality Monitoring**: Real-time environmental data tracking
- **Smart Contracts**: Automated civic service agreements
- **Community Feedback**: Transparent public discourse
- **Administrative Controls**: Secure governance mechanisms

## 🚀 Quick Start

### Prerequisites

- [Rust](https://rustlang.org/tools/install)
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools)
- [Anchor Framework](https://www.anchor-lang.com/docs/installation)
- [Node.js](https://nodejs.org/) (v16+)

### Installation

1. **Clone and setup**
   ```bash
   cd anchor_project
   npm install
   ```

2. **Configure Solana for devnet**
   ```bash
   solana config set --url devnet
   solana-keygen new  # If you don't have a keypair
   ```

3. **Request devnet SOL**
   ```bash
   solana airdrop 2
   ```

### Build and Deploy

1. **Build the program**
   ```bash
   anchor build
   ```

2. **Deploy to devnet**
   ```bash
   anchor deploy
   ```

3. **Run tests**
   ```bash
   anchor test
   ```

4. **Initialize sample contracts**
   ```bash
   node scripts/deploy.js
   ```

## 📋 Program Structure

### Smart Contract Features

#### Air Quality Management
- `initialize_air_quality(location, sensor_id)` - Create new sensor account
- `update_air_quality(aqi, pm25, pm10, co2, humidity, temperature)` - Update sensor data

#### Contract Management
- `initialize_contract(name, description, contract_type)` - Deploy new civic contract
- `update_contract_status(is_active)` - Enable/disable contracts
- `execute_contract()` - Execute contract logic

#### Data Validation
- AQI: 0-500 range validation
- PM2.5/PM10: 0-1000 μg/m³ validation
- CO2: 0-10000 ppm validation
- Humidity: 0-100% validation
- Temperature: -50°C to 100°C validation

### Account Structure

#### AirQuality Account
```rust
pub struct AirQuality {
    pub location: String,        // Sensor location
    pub sensor_id: String,       // Unique sensor identifier
    pub authority: Pubkey,       // Account authority
    pub aqi: u16,               // Air Quality Index
    pub pm25: f32,              // PM2.5 particles
    pub pm10: f32,              // PM10 particles
    pub co2: f32,               // CO2 levels
    pub humidity: f32,          // Humidity percentage
    pub temperature: f32,       // Temperature in Celsius
    pub created_at: i64,        // Creation timestamp
    pub updated_at: i64,        // Last update timestamp
}
```

#### Contract Account
```rust
pub struct Contract {
    pub name: String,           // Contract name
    pub description: String,    // Contract description
    pub contract_type: String,  // Type of contract
    pub authority: Pubkey,      // Contract authority
    pub is_active: bool,        // Active status
    pub execution_count: u64,   // Number of executions
    pub created_at: i64,        // Creation timestamp
    pub updated_at: i64,        // Last update timestamp
}
```

## 🔗 Program Derived Addresses (PDAs)

### Air Quality PDA
```
Seeds: ["air_quality", location, sensor_id]
```

### Contract PDA
```
Seeds: ["contract", contract_type, authority]
```

## 🧪 Testing

The test suite covers:

- ✅ Account initialization
- ✅ Data validation
- ✅ Access control
- ✅ Error handling
- ✅ Integration scenarios
- ✅ Civic transparency workflow

Run comprehensive tests:
```bash
anchor test --skip-local-validator
```

## 🌐 Frontend Integration

### JavaScript/TypeScript Client

```javascript
import { CivicLedgerClient } from './lib/solana/civicLedgerClient';

const client = new CivicLedgerClient(connection, wallet);
await client.initialize();

// Initialize air quality monitoring
const result = await client.initializeAirQuality('Downtown', 'AQ001');

// Update sensor data
await client.updateAirQuality('Downtown', 'AQ001', {
  aqi: 85,
  pm25: 25.5,
  pm10: 45.2,
  co2: 410.0,
  humidity: 65.0,
  temperature: 22.5
});
```

### React Integration

```jsx
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createCivicLedgerClient } from './lib/solana/civicLedgerClient';

function CivicDashboard() {
  const { connection } = useConnection();
  const { wallet } = useWallet();
  
  const client = createCivicLedgerClient(connection, wallet);
  
  // Use client for blockchain interactions
}
```

## 📊 Monitoring and Analytics

### Real-time Monitoring
- Contract health status
- Transaction throughput
- Error rates and performance
- Network statistics

### Transparency Features
- Public contract verification
- Community feedback system
- Administrative action logging
- Audit trail maintenance

## 🔐 Security Features

### Access Control
- Authority-based permissions
- PDA-derived accounts
- Input validation
- Overflow protection

### Data Integrity
- Cryptographic signatures
- Immutable audit trails
- Transparent operations
- Verifiable computations

## 🌍 Civic Transparency Use Cases

### Environmental Monitoring
- Real-time air quality tracking
- Public health alerts
- Environmental compliance
- Data transparency

### Smart City Services
- Traffic management
- Waste collection optimization
- Energy grid monitoring
- Public service contracts

### Community Engagement
- Public feedback collection
- Transparent governance
- Citizen participation
- Democratic oversight

## 📈 Performance Optimization

### Cost Efficiency
- Selective blockchain logging
- Batch operations support
- Gas optimization
- Economic transaction design

### Scalability
- PDA-based architecture
- Efficient data structures
- Minimal on-chain storage
- Off-chain computation support

## 🔧 Configuration

### Environment Variables
```bash
SOLANA_NETWORK=devnet
SOLANA_RPC_URL=https://api.devnet.solana.com
CIVIC_LEDGER_PROGRAM_ID=A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An
```

### Anchor.toml
```toml
[programs.devnet]
civic_ledger = "A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An"

[provider]
cluster = "Devnet"
wallet = "~/.config/solana/id.json"
```

## 🚀 Deployment Guide

### 1. Local Development
```bash
# Start local validator
solana-test-validator

# Deploy locally
anchor deploy --provider.cluster localnet
```

### 2. Devnet Deployment
```bash
# Configure for devnet
solana config set --url devnet

# Deploy to devnet
anchor deploy --provider.cluster devnet
```

### 3. Mainnet Deployment
```bash
# Configure for mainnet
solana config set --url mainnet-beta

# Deploy to mainnet (ensure sufficient SOL)
anchor deploy --provider.cluster mainnet-beta
```

## 📚 Resources

### Documentation
- [Anchor Book](https://book.anchor-lang.com/)
- [Solana Cookbook](https://solanacookbook.com/)
- [Solana Documentation](https://docs.solana.com/)

### Tools
- [Solana Explorer](https://explorer.solana.com/)
- [Solscan](https://solscan.io/)
- [Anchor CLI](https://www.anchor-lang.com/docs/cli)

### Community
- [Solana Discord](https://discord.gg/solana)
- [Anchor Discord](https://discord.gg/anchor)
- [School of Solana](https://www.schoolofsolana.com/)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- Powered by [Solana Blockchain](https://solana.com/)
- Inspired by [School of Solana](https://www.schoolofsolana.com/)
- Part of the Smart City OS ecosystem

---

**🏛️ CivicLedger - Transparent Governance on Blockchain**

*Empowering cities with blockchain transparency and community engagement.*