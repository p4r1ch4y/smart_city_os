import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { CivicLedger } from "../target/types/civic_ledger";
import { PublicKey, Keypair } from "@solana/web3.js";
import { expect } from "chai";

describe("civic_ledger", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CivicLedger as Program<CivicLedger>;
  const authority = provider.wallet as anchor.Wallet;

  // Test data
  const validLocation = "Downtown";
  const validSensorId = "AQ001";
  const invalidLocation = "A".repeat(60); // Too long
  const invalidSensorId = "A".repeat(40); // Too long

  const validContractName = "IoT Service Agreement";
  const validContractDescription = "Smart city IoT sensor data collection and monitoring service";
  const validContractType = "service";
  const invalidContractName = "A".repeat(60); // Too long

  let airQualityPDA: PublicKey;
  let contractPDA: PublicKey;

  before(async () => {
    // Derive PDAs
    [airQualityPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("air_quality"),
        Buffer.from(validLocation),
        Buffer.from(validSensorId)
      ],
      program.programId
    );

    [contractPDA] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("contract"),
        Buffer.from(validContractName),
        authority.publicKey.toBuffer()
      ],
      program.programId
    );
  });

  describe("Air Quality Tests", () => {
    it("Successfully initializes air quality with valid inputs", async () => {
      const tx = await program.methods
        .initializeAirQuality(validLocation, validSensorId)
        .accounts({
          airQuality: airQualityPDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize air quality transaction signature", tx);

      // Verify the account was created
      const airQualityAccount = await program.account.airQuality.fetch(airQualityPDA) as any;
      expect(airQualityAccount.location).to.equal(validLocation);
      expect(airQualityAccount.sensorId).to.equal(validSensorId);
      expect(airQualityAccount.authority.toString()).to.equal(authority.publicKey.toString());
    });

    it("Successfully updates air quality with valid sensor data", async () => {
      const validData = {
        aqi: 75,
        pm25: 12.5,
        pm10: 18.2,
        co2: 410.0,
        humidity: 65.5,
        temperature: 22.8
      };

      const tx = await program.methods
        .updateAirQuality(
          validData.aqi,
          validData.pm25,
          validData.pm10,
          validData.co2,
          validData.humidity,
          validData.temperature
        )
        .accounts({
          airQuality: airQualityPDA,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("Update air quality transaction signature", tx);

      // Verify the update
      const airQualityAccount = await program.account.airQuality.fetch(airQualityPDA) as any;
      expect(airQualityAccount.aqi).to.equal(validData.aqi);
      expect(airQualityAccount.pm25).to.be.closeTo(validData.pm25, 0.1);
      expect(airQualityAccount.pm10).to.be.closeTo(validData.pm10, 0.1);
      expect(airQualityAccount.co2).to.be.closeTo(validData.co2, 0.1);
      expect(airQualityAccount.humidity).to.be.closeTo(validData.humidity, 0.1);
      expect(airQualityAccount.temperature).to.be.closeTo(validData.temperature, 0.1);
    });

    it("Fails to update air quality with invalid AQI (> 500)", async () => {
      try {
        await program.methods
          .updateAirQuality(
            501, // Invalid AQI
            12.5,
            18.2,
            410.0,
            65.5,
            22.8
          )
          .accounts({
            airQuality: airQualityPDA,
            authority: authority.publicKey,
          })
          .rpc();
        expect.fail("Should have failed with invalid AQI");
      } catch (error: any) {
        expect(error.message).to.include("Invalid AQI value");
      }
    });

    it("Fails to update air quality with invalid PM2.5 (< 0)", async () => {
      try {
        await program.methods
          .updateAirQuality(
            75,
            -1.0, // Invalid PM2.5
            18.2,
            410.0,
            65.5,
            22.8
          )
          .accounts({
            airQuality: airQualityPDA,
            authority: authority.publicKey,
          })
          .rpc();
        expect.fail("Should have failed with invalid PM2.5");
      } catch (error: any) {
        expect(error.message).to.include("Invalid PM2.5 value");
      }
    });

    it("Fails to update air quality with invalid humidity (> 100)", async () => {
      try {
        await program.methods
          .updateAirQuality(
            75,
            12.5,
            18.2,
            410.0,
            150.0, // Invalid humidity
            22.8
          )
          .accounts({
            airQuality: airQualityPDA,
            authority: authority.publicKey,
          })
          .rpc();
        expect.fail("Should have failed with invalid humidity");
      } catch (error: any) {
        expect(error.message).to.include("Invalid humidity value");
      }
    });

    it("Fails to update air quality with invalid temperature (< -50)", async () => {
      try {
        await program.methods
          .updateAirQuality(
            75,
            12.5,
            18.2,
            410.0,
            65.5,
            -60.0 // Invalid temperature
          )
          .accounts({
            airQuality: airQualityPDA,
            authority: authority.publicKey,
          })
          .rpc();
        expect.fail("Should have failed with invalid temperature");
      } catch (error: any) {
        expect(error.message).to.include("Invalid temperature value");
      }
    });

    it("Fails to update air quality with unauthorized authority", async () => {
      const unauthorizedKeypair = Keypair.generate();
      
      // Airdrop some SOL to the unauthorized keypair for transaction fees
      const airdropSignature = await provider.connection.requestAirdrop(
        unauthorizedKeypair.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      try {
        await program.methods
          .updateAirQuality(75, 12.5, 18.2, 410.0, 65.5, 22.8)
          .accounts({
            airQuality: airQualityPDA,
            authority: unauthorizedKeypair.publicKey,
          })
          .signers([unauthorizedKeypair])
          .rpc();
        expect.fail("Should have failed with unauthorized access");
      } catch (error: any) {
        expect(error.message).to.include("Unauthorized access");
      }
    });
  });

  describe("Contract Tests", () => {
    it("Successfully initializes contract with valid inputs", async () => {
      const tx = await program.methods
        .initializeContract(
          validContractName,
          validContractDescription,
          validContractType
        )
        .accounts({
          contract: contractPDA,
          authority: authority.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();

      console.log("Initialize contract transaction signature", tx);

      // Verify the account was created
      const contractAccount = await program.account.contract.fetch(contractPDA) as any;
      expect(contractAccount.name).to.equal(validContractName);
      expect(contractAccount.description).to.equal(validContractDescription);
      expect(contractAccount.contractType).to.equal(validContractType);
      expect(contractAccount.authority.toString()).to.equal(authority.publicKey.toString());
      expect(contractAccount.isActive).to.be.true;
      // expect(contractAccount.version).to.equal(1);
      // expect(contractAccount.executionCount).to.equal(0);
    });

    it("Successfully updates contract status", async () => {
      const tx = await program.methods
        .updateContractStatus(false)
        .accounts({
          contract: contractPDA,
          authority: authority.publicKey,
        })
        .rpc();

      console.log("Update contract status transaction signature", tx);

      // Verify the update
      const contractAccount = await program.account.contract.fetch(contractPDA) as any;
      expect(contractAccount.isActive).to.be.false;
    });

    it("Fails to initialize contract with name too long", async () => {
      const [longNameContractPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("contract"),
          Buffer.from(invalidContractName),
          authority.publicKey.toBuffer()
        ],
        program.programId
      );

      try {
        await program.methods
          .initializeContract(
            invalidContractName, // Too long
            validContractDescription,
            validContractType
          )
          .accounts({
            contract: longNameContractPDA,
            authority: authority.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          })
          .rpc();
        expect.fail("Should have failed with name too long");
      } catch (error: any) {
        expect(error.message).to.include("Name too long");
      }
    });

    it("Fails to update contract with unauthorized authority", async () => {
      const unauthorizedKeypair = Keypair.generate();
      
      // Airdrop some SOL to the unauthorized keypair for transaction fees
      const airdropSignature = await provider.connection.requestAirdrop(
        unauthorizedKeypair.publicKey,
        1 * anchor.web3.LAMPORTS_PER_SOL
      );
      await provider.connection.confirmTransaction(airdropSignature);

      try {
        await program.methods
          .updateContractStatus(true)
          .accounts({
            contract: contractPDA,
            authority: unauthorizedKeypair.publicKey,
          })
          .signers([unauthorizedKeypair])
          .rpc();
        expect.fail("Should have failed with unauthorized access");
      } catch (error: any) {
        expect(error.message).to.include("Unauthorized access");
      }
    });

    // it("Successfully executes contract", async () => {
    //   const tx = await program.methods
    //     .executeContract()
    //     .accounts({
    //       contract: contractPDA,
    //       authority: authority.publicKey,
    //     })
    //     .rpc();

    //   console.log("Execute contract transaction signature", tx);

    //   // Verify the execution count increased
    //   const contractAccount = await program.account.contract.fetch(contractPDA);
    //   expect(contractAccount.executionCount).to.equal(1);
    // });

    // it("Successfully updates contract details", async () => {
    //   const newName = "Updated Contract";
    //   const newDescription = "Updated description for the contract";

    //   const tx = await program.methods
    //     .updateContractDetails(newName, newDescription, null)
    //     .accounts({
    //       contract: contractPDA,
    //       authority: authority.publicKey,
    //     })
    //     .rpc();

    //   console.log("Update contract details transaction signature", tx);

    //   // Verify the updates
    //   const contractAccount = await program.account.contract.fetch(contractPDA);
    //   expect(contractAccount.name).to.equal(newName);
    //   expect(contractAccount.description).to.equal(newDescription);
    //   expect(contractAccount.version).to.equal(2); // Version should increment
    // });
  });

  // describe("Economic Optimization Tests", () => {
  //   it("Skips air quality update when change is not significant", async () => {
  //     // First, initialize with some data
  //     await program.methods
  //       .updateAirQuality(100, 25.0, 15.0, 400.0, 50.0, 20.0)
  //       .accounts({
  //         airQuality: airQualityPDA,
  //         authority: authority.publicKey,
  //       })
  //       .rpc();

  //     // Try to update with very similar values (should be skipped due to economic optimization)
  //     const tx = await program.methods
  //       .updateAirQuality(101, 25.1, 15.1, 401.0, 50.1, 20.1) // Very small changes
  //       .accounts({
  //         airQuality: airQualityPDA,
  //         authority: authority.publicKey,
  //       })
  //       .rpc();

  //     console.log("Economic optimization test transaction signature", tx);

  //     // The transaction should succeed but the data might not change significantly
  //     const airQualityAccount = await program.account.airQuality.fetch(airQualityPDA);
  //     expect(airQualityAccount.updateCount).to.be.greaterThan(0);
  //   });

  //   it("Processes air quality update when change is significant", async () => {
  //     const initialAccount = await program.account.airQuality.fetch(airQualityPDA);
  //     const initialUpdateCount = initialAccount.updateCount;

  //     // Update with significant changes
  //     const tx = await program.methods
  //       .updateAirQuality(200, 50.0, 30.0, 800.0, 80.0, 35.0) // Significant changes
  //       .accounts({
  //         airQuality: airQualityPDA,
  //         authority: authority.publicKey,
  //       })
  //       .rpc();

  //     console.log("Significant change test transaction signature", tx);

  //     // Verify the update was processed
  //     const airQualityAccount = await program.account.airQuality.fetch(airQualityPDA);
  //     expect(airQualityAccount.aqi).to.equal(200);
  //     expect(airQualityAccount.pm25).to.equal(50.0);
  //     expect(airQualityAccount.updateCount).to.equal(initialUpdateCount + 1);
  //   });
  // });

  describe("Fuzzing Tests", () => {
    // Generate random test data for fuzzing
    const generateRandomString = (length: number): string => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let result = '';
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const generateRandomFloat = (min: number, max: number): number => {
      return Math.random() * (max - min) + min;
    };

    const generateRandomInt = (min: number, max: number): number => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    it("Fuzzing: Random valid air quality updates", async () => {
      for (let i = 0; i < 10; i++) {
        const randomData = {
          aqi: generateRandomInt(0, 500),
          pm25: generateRandomFloat(0, 1000),
          pm10: generateRandomFloat(0, 1000),
          co2: generateRandomFloat(0, 10000),
          humidity: generateRandomFloat(0, 100),
          temperature: generateRandomFloat(-50, 100)
        };

        try {
          await program.methods
            .updateAirQuality(
              randomData.aqi,
              randomData.pm25,
              randomData.pm10,
              randomData.co2,
              randomData.humidity,
              randomData.temperature
            )
            .accounts({
              airQuality: airQualityPDA,
              authority: authority.publicKey,
            })
            .rpc();

          console.log(`Fuzzing iteration ${i + 1}: Success with data`, randomData);
        } catch (error: any) {
          console.log(`Fuzzing iteration ${i + 1}: Failed with data`, randomData, error.message);
          expect.fail(`Valid random data should not fail: ${error.message}`);
        }
      }
    });

    it("Fuzzing: Random invalid air quality updates", async () => {
      let invalidAttempts = 0;
      const totalAttempts = 20;

      for (let i = 0; i < totalAttempts; i++) {
        // Generate potentially invalid data
        const randomData = {
          aqi: generateRandomInt(-100, 1000), // Can be invalid (>500 or <0)
          pm25: generateRandomFloat(-100, 2000), // Can be invalid (<0 or >1000)
          pm10: generateRandomFloat(-100, 2000), // Can be invalid (<0 or >1000)
          co2: generateRandomFloat(-1000, 20000), // Can be invalid (<0 or >10000)
          humidity: generateRandomFloat(-50, 200), // Can be invalid (<0 or >100)
          temperature: generateRandomFloat(-100, 200) // Can be invalid (<-50 or >100)
        };

        try {
          await program.methods
            .updateAirQuality(
              randomData.aqi,
              randomData.pm25,
              randomData.pm10,
              randomData.co2,
              randomData.humidity,
              randomData.temperature
            )
            .accounts({
              airQuality: airQualityPDA,
              authority: authority.publicKey,
            })
            .rpc();

          console.log(`Fuzzing iteration ${i + 1}: Unexpectedly succeeded with data`, randomData);
        } catch (error: any) {
          invalidAttempts++;
          console.log(`Fuzzing iteration ${i + 1}: Correctly failed with data`, randomData);
        }
      }

      console.log(`Fuzzing results: ${invalidAttempts}/${totalAttempts} attempts correctly failed validation`);
      expect(invalidAttempts).to.be.greaterThan(0, "At least some invalid data should be rejected");
    });

    it("Fuzzing: Random contract names and descriptions", async () => {
      for (let i = 0; i < 5; i++) {
        const randomName = generateRandomString(generateRandomInt(1, 50));
        const randomDescription = generateRandomString(generateRandomInt(1, 200));
        const randomType = generateRandomString(generateRandomInt(1, 30));

        const [randomContractPDA] = PublicKey.findProgramAddressSync(
          [
            Buffer.from("contract"),
            Buffer.from(randomName),
            authority.publicKey.toBuffer()
          ],
          program.programId
        );

        try {
          await program.methods
            .initializeContract(randomName, randomDescription, randomType)
            .accounts({
              contract: randomContractPDA,
              authority: authority.publicKey,
              systemProgram: anchor.web3.SystemProgram.programId,
            })
            .rpc();

          console.log(`Contract fuzzing iteration ${i + 1}: Success with name "${randomName}"`);
          
          // Clean up by deactivating
          await program.methods
            .updateContractStatus(false)
            .accounts({
              contract: randomContractPDA,
              authority: authority.publicKey,
            })
            .rpc();
        } catch (error: any) {
          console.log(`Contract fuzzing iteration ${i + 1}: Failed with name "${randomName}": ${error.message}`);
        }
      }
    });
  });

  describe("PDA Verification Tests", () => {
    it("Verifies air quality PDA derivation", async () => {
      const [expectedPDA, expectedBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("air_quality"),
          Buffer.from(validLocation),
          Buffer.from(validSensorId)
        ],
        program.programId
      );

      expect(airQualityPDA.toString()).to.equal(expectedPDA.toString());
      console.log("Air Quality PDA:", airQualityPDA.toString());
      console.log("Expected PDA:", expectedPDA.toString());
      console.log("Bump:", expectedBump);
    });

    it("Verifies contract PDA derivation", async () => {
      const [expectedPDA, expectedBump] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("contract"),
          Buffer.from(validContractName),
          authority.publicKey.toBuffer()
        ],
        program.programId
      );

      expect(contractPDA.toString()).to.equal(expectedPDA.toString());
      console.log("Contract PDA:", contractPDA.toString());
      console.log("Expected PDA:", expectedPDA.toString());
      console.log("Bump:", expectedBump);
    });

    it("Fetches and displays all account data", async () => {
      const airQualityAccount = await program.account.airQuality.fetch(airQualityPDA) as any;
      const contractAccount = await program.account.contract.fetch(contractPDA) as any;

      console.log("Air Quality Account Data:");
      console.log("- Location:", airQualityAccount.location);
      console.log("- Sensor ID:", airQualityAccount.sensorId);
      console.log("- AQI:", airQualityAccount.aqi);
      console.log("- PM2.5:", airQualityAccount.pm25);
      console.log("- PM10:", airQualityAccount.pm10);
      console.log("- CO2:", airQualityAccount.co2);
      console.log("- Humidity:", airQualityAccount.humidity);
      console.log("- Temperature:", airQualityAccount.temperature);

      console.log("Contract Account Data:");
      console.log("- Name:", contractAccount.name);
      console.log("- Description:", contractAccount.description);
      console.log("- Type:", contractAccount.contractType);
      console.log("- Active:", contractAccount.isActive);
    });
  });
});