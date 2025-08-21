use anchor_lang::prelude::*;

// Module declarations
pub mod air_quality;
pub mod contract;
pub mod errors;
pub mod events;
pub mod utils;

// Re-exports for clean API
pub use air_quality::*;
pub use contract::*;
pub use errors::*;
pub use events::*;
pub use utils::*;

declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS");

/// Smart City OS - Civic Ledger Program
///
/// This program manages air quality sensors and civic contracts on the Solana blockchain
/// with economic optimizations to minimize transaction costs while maintaining data integrity.
#[program]
pub mod civic_ledger {
    use super::*;

    /// Initialize a new air quality sensor
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `location` - Sensor location (max 50 chars)
    /// * `sensor_id` - Unique sensor identifier (max 30 chars)
    pub fn initialize_air_quality(
        ctx: Context<InitializeAirQuality>,
        location: String,
        sensor_id: String,
    ) -> Result<()> {
        ctx.accounts.process(location, sensor_id)
    }

    /// Update air quality sensor data with economic optimization
    ///
    /// Only updates if the change is significant enough to justify the transaction cost
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `aqi` - Air Quality Index (0-500)
    /// * `pm25` - PM2.5 concentration (0-1000 μg/m³)
    /// * `pm10` - PM10 concentration (0-1000 μg/m³)
    /// * `co2` - CO2 concentration (0-10000 ppm)
    /// * `humidity` - Relative humidity (0-100%)
    /// * `temperature` - Temperature (-50 to 100°C)
    pub fn update_air_quality(
        ctx: Context<UpdateAirQuality>,
        aqi: u16,
        pm25: f32,
        pm10: f32,
        co2: f32,
        humidity: f32,
        temperature: f32,
    ) -> Result<()> {
        ctx.accounts.process(aqi, pm25, pm10, co2, humidity, temperature)
    }

    /// Batch update multiple air quality sensors (economic optimization)
    ///
    /// More cost-effective than individual updates when updating multiple sensors
    ///
    /// # Arguments
    /// * `ctx` - The context containing multiple sensor accounts
    /// * `sensor_data` - Vector of sensor data tuples (aqi, pm25, pm10, co2, humidity, temp)
    pub fn batch_update_air_quality(
        ctx: Context<BatchUpdateAirQuality>,
        sensor_data: Vec<(u16, f32, f32, f32, f32, f32)>,
    ) -> Result<()> {
        ctx.accounts.process(sensor_data)
    }

    /// Initialize a new civic contract
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `name` - Contract name (max 50 chars)
    /// * `description` - Contract description (max 200 chars)
    /// * `contract_type` - Type of contract (max 30 chars)
    pub fn initialize_contract(
        ctx: Context<InitializeContract>,
        name: String,
        description: String,
        contract_type: String,
    ) -> Result<()> {
        ctx.accounts.process(name, description, contract_type)
    }

    /// Update contract status with economic optimization
    ///
    /// Only updates if the status actually changes
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `is_active` - New active status
    pub fn update_contract_status(
        ctx: Context<UpdateContract>,
        is_active: bool,
    ) -> Result<()> {
        ctx.accounts.process_status_update(is_active)
    }

    /// Update contract details with economic optimization
    ///
    /// Only updates if the details actually change
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `name` - Optional new name
    /// * `description` - Optional new description
    /// * `contract_type` - Optional new contract type
    pub fn update_contract_details(
        ctx: Context<UpdateContractDetails>,
        name: Option<String>,
        description: Option<String>,
        contract_type: Option<String>,
    ) -> Result<()> {
        ctx.accounts.process(name, description, contract_type)
    }

    /// Execute a contract (increment usage counter)
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    pub fn execute_contract(
        ctx: Context<ExecuteContract>,
    ) -> Result<()> {
        ctx.accounts.process()
    }

    /// Batch update contract statuses (economic optimization)
    ///
    /// More cost-effective than individual updates when updating multiple contracts
    ///
    /// # Arguments
    /// * `ctx` - The context containing multiple contract accounts
    /// * `statuses` - Vector of new status values
    pub fn batch_contract_status_update(
        ctx: Context<BatchContractOperation>,
        statuses: Vec<bool>,
    ) -> Result<()> {
        ctx.accounts.process_batch_status_update(statuses)
    }
}