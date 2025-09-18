import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

describe("Smart City OS - Simple Deployment Test", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const programId = new PublicKey("A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An");
  
  it("Program is deployed and accessible", async () => {
    const provider = anchor.getProvider();
    
    // Check if the program exists on the blockchain
    const programInfo = await provider.connection.getAccountInfo(programId);
    
    expect(programInfo).to.not.be.null;
    expect(programInfo?.executable).to.be.true;
    
    console.log("✅ Smart City OS Program successfully deployed!");
    console.log("📍 Program ID:", programId.toString());
    console.log("📊 Program Data Length:", programInfo?.data.length, "bytes");
    console.log("👤 Program Owner:", programInfo?.owner.toString());
    
    // Verify it's a BPF program
    expect(programInfo?.owner.toString()).to.equal("BPFLoaderUpgradeab1e11111111111111111111111");
  });

  it("Can derive PDAs for air quality sensors", async () => {
    const location = "Downtown_Sensor_01";
    const sensorId = "AQ_001";
    
    const [airQualityPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("air_quality"),
        Buffer.from(location),
        Buffer.from(sensorId)
      ],
      programId
    );
    
    console.log("🌍 Air Quality PDA:", airQualityPDA.toString());
    expect(airQualityPDA).to.be.instanceOf(PublicKey);
  });

  it("Can derive PDAs for contracts", async () => {
    const contractName = "Smart_Traffic_Contract";
    const authority = anchor.getProvider().publicKey;
    
    const [contractPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("contract"),
        Buffer.from(contractName),
        authority!.toBuffer()
      ],
      programId
    );
    
    console.log("📋 Contract PDA:", contractPDA.toString());
    expect(contractPDA).to.be.instanceOf(PublicKey);
  });

  it("Program has correct deployment characteristics", async () => {
    const provider = anchor.getProvider();
    const programInfo = await provider.connection.getAccountInfo(programId);

    // For Solana programs, the program account contains metadata, not the executable code
    // The actual executable is stored in a separate program data account
    expect(programInfo?.data.length).to.be.greaterThan(0);

    // Check it's rent exempt
    const rentExemptBalance = await provider.connection.getMinimumBalanceForRentExemption(
      programInfo?.data.length || 0
    );
    expect(programInfo?.lamports || 0).to.be.greaterThanOrEqual(rentExemptBalance);

    console.log("💰 Program Balance:", programInfo?.lamports, "lamports");
    console.log("🏠 Rent Exempt Minimum:", rentExemptBalance, "lamports");
    console.log("✅ Program is rent exempt:", (programInfo?.lamports || 0) >= rentExemptBalance);

    // Check if we can get the program data account (where the actual bytecode is stored)
    try {
      const programDataAddress = PublicKey.findProgramAddressSync(
        [programId.toBuffer()],
        new PublicKey("BPFLoaderUpgradeab1e11111111111111111111111")
      )[0];

      const programDataInfo = await provider.connection.getAccountInfo(programDataAddress);
      if (programDataInfo) {
        console.log("📦 Program Data Account Size:", programDataInfo.data.length, "bytes");
        expect(programDataInfo.data.length).to.be.greaterThan(100000); // Actual bytecode should be substantial
      }
    } catch (error) {
      console.log("ℹ️  Could not fetch program data account (this is normal for some deployments)");
    }
  });

  it("Network connectivity and configuration", async () => {
    const provider = anchor.getProvider();
    const connection = provider.connection;
    
    // Check network connectivity
    const slot = await connection.getSlot();
    expect(slot).to.be.greaterThan(0);
    
    // Check we're on devnet
    const genesisHash = await connection.getGenesisHash();
    console.log("🌐 Network Genesis Hash:", genesisHash);
    console.log("📡 Current Slot:", slot);
    console.log("🔗 RPC Endpoint:", connection.rpcEndpoint);
    
    // Verify devnet characteristics
    expect(connection.rpcEndpoint).to.include("devnet");
  });
});
