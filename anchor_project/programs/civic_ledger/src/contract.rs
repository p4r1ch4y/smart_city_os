use crate::CustomError;
// PDA seed conversion helper
pub fn contract_name_seed(name: &str) -> [u8; 8] {
    if name.as_bytes().len() > 8 {
        // Return an error if name is too long
        panic!("Name too long");
    }
    let mut name_bytes = [0u8; 8];
    let src = name.as_bytes();
    let len = src.len().min(8);
    name_bytes[..len].copy_from_slice(&src[..len]);
    name_bytes
}
//
 
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeContract<'info> {
    // PDA seed prepared outside macro for correct lifetimes
    #[account(
        init,
        payer = authority,
        space = Contract::LEN,
        seeds = [b"contract", &contract_name_seed(&name), authority.key().as_ref()],
        bump
    )]
    //

    pub contract: Account<'info, Contract>,
    #[account(mut)]
    pub authority: Signer<'info>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateContract<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract: Account<'info, Contract>,
    pub authority: Signer<'info>,
}

#[account]
pub struct Contract {
    pub name: String,          // 50 chars max
    pub description: String,   // 200 chars max
    pub contract_type: String, // 30 chars max
    pub authority: Pubkey,     // 32 bytes
    pub is_active: bool,       // 1 byte
    pub created_at: i64,       // 8 bytes
    pub updated_at: i64,       // 8 bytes
}

impl Contract {
    pub const LEN: usize = 8 + // discriminator
        4 + 50 + // name (String)
        4 + 200 + // description (String)
        4 + 30 + // contract_type (String)
        32 + // authority (Pubkey)
        1 + // is_active (bool)
        8 + // created_at (i64)
        8; // updated_at (i64)
}

#[event]
pub struct ContractInitialized {
    pub contract: Pubkey,
    pub name: String,
    pub description: String,
    pub contract_type: String,
    pub authority: Pubkey,
}

#[event]
pub struct ContractStatusUpdated {
    pub contract: Pubkey,
    pub is_active: bool,
    pub timestamp: i64,
}
