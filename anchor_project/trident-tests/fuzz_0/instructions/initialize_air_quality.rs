use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")]
#[discriminator([7u8, 154u8, 179u8, 64u8, 55u8, 88u8, 238u8, 192u8])]
pub struct InitializeAirQualityInstruction {
    pub accounts: InitializeAirQualityInstructionAccounts,
    pub data: InitializeAirQualityInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(InitializeAirQualityInstructionData)]
#[storage(FuzzAccounts)]
pub struct InitializeAirQualityInstructionAccounts {
    #[account(mut)]
    pub air_quality: TridentAccount,

    #[account(mut, signer)]
    pub authority: TridentAccount,

    #[account(address = "11111111111111111111111111111111")]
    pub system_program: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct InitializeAirQualityInstructionData {
    pub location: String,

    pub sensor_id: String,
}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for InitializeAirQualityInstruction {
    type IxAccounts = FuzzAccounts;
}
