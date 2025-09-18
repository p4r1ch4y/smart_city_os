use anchor_lang::prelude::*;

/// Event emitted when air quality sensor is initialized
#[event]
pub struct AirQualityInitialized {
    pub air_quality: Pubkey,
    pub location: String,
    pub sensor_id: String,
    pub authority: Pubkey,
}

/// Event emitted when air quality data is updated
#[event]
pub struct AirQualityUpdated {
    pub air_quality: Pubkey,
    pub aqi: u16,
    pub pm25: f32,
    pub pm10: f32,
    pub co2: f32,
    pub humidity: f32,
    pub temperature: f32,
    pub timestamp: i64,
}

/// Event emitted when contract is initialized
#[event]
pub struct ContractInitialized {
    pub contract: Pubkey,
    pub name: String,
    pub description: String,
    pub contract_type: String,
    pub authority: Pubkey,
}

/// Event emitted when contract status is updated
#[event]
pub struct ContractStatusUpdated {
    pub contract: Pubkey,
    pub is_active: bool,
    pub timestamp: i64,
}

/// Event emitted when contract details are updated
#[event]
pub struct ContractUpdated {
    pub contract: Pubkey,
    pub name: String,
    pub description: String,
    pub contract_type: String,
    pub version: u32,
    pub timestamp: i64,
}

/// Event emitted when contract is executed
#[event]
pub struct ContractExecuted {
    pub contract: Pubkey,
    pub execution_count: u32,
    pub timestamp: i64,
}

/// Event emitted for batch operations (economic optimization)
#[event]
pub struct BatchOperationCompleted {
    pub operation_type: String,
    pub accounts_affected: u8,
    pub timestamp: i64,
}

/// Event emitted when economic threshold prevents update
#[event]
pub struct EconomicThresholdNotMet {
    pub account: Pubkey,
    pub operation: String,
    pub reason: String,
    pub timestamp: i64,
}
