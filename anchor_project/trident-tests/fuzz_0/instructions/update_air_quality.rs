use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")]
#[discriminator([108u8, 57u8, 118u8, 10u8, 135u8, 65u8, 55u8, 36u8])]
pub struct UpdateAirQualityInstruction {
    pub accounts: UpdateAirQualityInstructionAccounts,
    pub data: UpdateAirQualityInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(UpdateAirQualityInstructionData)]
#[storage(FuzzAccounts)]
pub struct UpdateAirQualityInstructionAccounts {
    #[account(mut)]
    pub air_quality: TridentAccount,

    #[account(signer)]
    pub authority: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct UpdateAirQualityInstructionData {
    pub aqi: u16,

    pub pm25: f32,

    pub pm10: f32,

    pub co2: f32,

    pub humidity: f32,

    pub temperature: f32,
}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for UpdateAirQualityInstruction {
    type IxAccounts = FuzzAccounts;
}
