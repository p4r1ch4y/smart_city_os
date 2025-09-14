use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

/// File containing all custom types which can be used
/// in transactions and instructions or invariant checks.
///
/// You can define your own custom types here.

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct AirQuality {
    pub location: String,

    pub sensor_id: String,

    pub authority: TridentPubkey,

    pub aqi: u16,

    pub pm25: f32,

    pub pm10: f32,

    pub co2: f32,

    pub humidity: f32,

    pub temperature: f32,

    pub created_at: i64,

    pub updated_at: i64,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct AirQualityInitialized {
    pub air_quality: TridentPubkey,

    pub location: String,

    pub sensor_id: String,

    pub authority: TridentPubkey,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct AirQualityUpdated {
    pub air_quality: TridentPubkey,

    pub aqi: u16,

    pub pm25: f32,

    pub pm10: f32,

    pub co2: f32,

    pub humidity: f32,

    pub temperature: f32,

    pub timestamp: i64,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct Contract {
    pub name: String,

    pub description: String,

    pub contract_type: String,

    pub authority: TridentPubkey,

    pub is_active: bool,

    pub created_at: i64,

    pub updated_at: i64,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct ContractInitialized {
    pub contract: TridentPubkey,

    pub name: String,

    pub description: String,

    pub contract_type: String,

    pub authority: TridentPubkey,
}

#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct ContractStatusUpdated {
    pub contract: TridentPubkey,

    pub is_active: bool,

    pub timestamp: i64,
}
