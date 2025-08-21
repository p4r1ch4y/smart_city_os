use crate::fuzz_accounts::FuzzAccounts;
use crate::types::*;
use borsh::{BorshDeserialize, BorshSerialize};
use trident_fuzz::fuzzing::*;

#[derive(TridentInstruction, Default)]
#[program_id("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS")]
#[discriminator([131u8, 188u8, 75u8, 62u8, 150u8, 188u8, 224u8, 131u8])]
pub struct UpdateContractStatusInstruction {
    pub accounts: UpdateContractStatusInstructionAccounts,
    pub data: UpdateContractStatusInstructionData,
}

/// Instruction Accounts
#[derive(Debug, Clone, TridentAccounts, Default)]
#[instruction_data(UpdateContractStatusInstructionData)]
#[storage(FuzzAccounts)]
pub struct UpdateContractStatusInstructionAccounts {
    #[account(mut)]
    pub contract: TridentAccount,

    #[account(signer)]
    pub authority: TridentAccount,
}

/// Instruction Data
#[derive(Debug, BorshDeserialize, BorshSerialize, Clone, Default)]
pub struct UpdateContractStatusInstructionData {
    pub is_active: bool,
}

/// Implementation of instruction setters for fuzzing
///
/// Provides methods to:
/// - Set instruction data during fuzzing
/// - Configure instruction accounts during fuzzing
/// - (Optional) Set remaining accounts during fuzzing
///
/// Docs: https://ackee.xyz/trident/docs/latest/start-fuzzing/writting-fuzz-test/
impl InstructionHooks for UpdateContractStatusInstruction {
    type IxAccounts = FuzzAccounts;
}
