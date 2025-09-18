use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An")]
#[discriminator([181u8, 192u8, 35u8, 141u8, 212u8, 113u8, 138u8, 94u8])]
pub struct InitializeContractInstruction {
    pub accounts: InitializeContractInstructionAccounts,
    pub data: InitializeContractInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(InitializeContractInstructionData)]
#[storage(FuzzAccounts)]
pub struct InitializeContractInstructionAccounts {
    #[account(mut)]
    pub contract: TridentAccount,

    #[account(mut, signer)]
    pub authority: TridentAccount,

    #[account(address = "11111111111111111111111111111111")]
    pub system_program: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct InitializeContractInstructionData {
    pub name: String,

    pub description: String,

    pub contract_type: String,
}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for InitializeContractInstruction {
    type IxAccounts = FuzzAccounts;
}
