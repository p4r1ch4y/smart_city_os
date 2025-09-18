

***

# PROJECT_DESCRIPTION.md

***

## 📛 Project Title

**CivicLedger: On-Chain Verifiable Civic Data Microservice for Smart City OS**

***

## 📝 Description

CivicLedger is the blockchain-powered verifiability layer of **Smart City OS**, a comprehensive urban management platform. This project demonstrates how modern smart cities can achieve **transparent, verifiable, and tamper-proof reporting of critical civic data** using Solana blockchain infrastructure. 

While the main Smart City OS stack handles real-time IoT visualization, citizen dashboards, role-based security, and alerting, the CivicLedger microservice focuses specifically on creating an **immutable, audit-friendly record for priority sensor data** (such as air quality events) and public contracts — all as required by the School of Solana submission.

**Key Goals:**
- Provide on-chain proof and public verification of real sensor readings/events.
- Ensure that citizens and auditors can verify what the city claims matches what is cryptographically posted on Solana Devnet.
- Serve as both an academic capstone demonstration and a real Solana dApp.

***

## 🏗️ Architecture Overview

- **Smart City OS Core**:
  - `backend/` (Node.js, Express): Handles sensors, alerts, real-time data, and relays priority events to Solana.
  - `frontend/` (React 18): Main dashboard with "Verify On-Chain" integration.
  - `iot-simulation/`: Python scripts to generate live sensor data.
  - `docs/`: Full architecture, guides, future roadmap.

- **Blockchain Integration**:  
  - `anchor_project/` (Solana, Anchor): Contains Anchor program ("CivicLedger"), instruction tests, and PDA logic.
  - `/frontend/` (React): Implements UI for on-chain verification.

***

## 💡 Main Features and Flow

1. **Sensors feed live data** via the IoT simulation and backend.  
2. For *critical events* (e.g. high Air Quality Index, new city contract), the backend logs a summary to the Solana Devnet **via the CivicLedger Anchor program**, writing to a dedicated PDA derived by unique keys (e.g. sensor ID).
3. TypeScript tests (“happy” and “unhappy”/fuzz) ensure on-chain logic is robust and safe.
4. The main dashboard exposes a **"Verify On-Chain"** button beside each logged event. On click, the frontend queries the correct PDA using Web3.js and presents a confirmation (value, timestamp, Solana Explorer link) to the user.
5. Citizens and admins have transparent, tamper-evident, real-world data.

***

## 🔎 School of Solana Requirements Checklist

| Requirement                                                                                    | Status         | Notes                                                                   |
|-----------------------------------------------------------------------------------------------|----------------|-------------------------------------------------------------------------|
| Deployed Anchor program on Devnet                                                             | ✅              | CivicLedger program deployed (Devnet address below)                      |
| PDA usage for on-chain data                                                                   | ✅              | Each major sensor/contract has a distinct PDA                            |
| At least one TypeScript test per instruction, both happy & unhappy cases ("fuzzing")          | ✅              | Located in `/anchor_project/tests/`                                      |
| Simple deployed frontend to interact with dApp                                                | ✅              | `/frontend/`, main dashboard, with "Verify On-Chain" UI integration      |
| Completed PROJECT_DESCRIPTION.md                                                              | ✅              | This file                                                                |
| Link to dashboard + Solana contract address                                                   | (fill in post-deployment) |                                                                         |

***

## 👨💻 Technical Implementation

- **Anchor Program (CivicLedger):**
  - Written in Rust using [Anchor](https://book.anchor-lang.com/).
  - Each civic event is logged to its own PDA (e.g. `PDA["air_quality", sensor_id]`).
  - Instructions include: `record_air_quality_reading` and (optionally) `log_contract`.
  - Input validation and authority checks (only backend/city can write).

- **Solana Tests (TypeScript, Mocha):**
  - `/anchor_project/tests/`
  - Checks happy-path (valid events by authorized account).
  - Checks failures (invalid value, unauthorized, and fuzz/random input cases).

- **Frontend Integration:**
  - When "Verify On-Chain" is clicked, React queries PDA using `@solana/web3.js`, fetches state, and displays to user.
  - Shows on-chain value, timestamp, and link to Solana Explorer.

- **Backend "Bridge":**
  - After logging critical event in database, triggers transaction to Solana contract.
  - Stores tx hash for referential lookup.

***

## 🚀 Deployment Links

> _Fill these after deployment_
- **Frontend Dashboard:** [https://your-dapp-frontend-url.com](https://your-dapp-frontend-url.com)
- **Anchor Program Devnet Address:** `YOUR_PROGRAM_ADDRESS`
- **TypeScript Tests:** `/anchor_project/tests/`
- **Main Source Repo:** [GitHub Link Here](https://github.com/p4r1ch4y/smart_city_os)

***

## 🛡️ Known Limitations & Future Work

- Roles are limited to **Admin** and **Citizen** for MVP. RBAC extension planned.
- Predictive analytics (traffic/energy/environment) is a *coming soon* feature (Python, ML microservice scaffolded).
- Logging multiple data types on-chain and multi-authority support are planned, with demo scope limited to air quality for evaluation clarity.
- Advanced multi-chain (Layer 2) or privacy-preserving zk features can be future stretch goals.

***

## 👏 Acknowledgments

- [School of Solana](https://solana.com/developers/courses) for educational materials and final project evaluation.
- Open source contributors to Anchor, Solana, React, and the smart city open governance community.

***

**Contact for questions/support:** [Your Email or Discord/Telegram]

***
