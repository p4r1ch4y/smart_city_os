use anchor_lang::prelude::*;
use crate::errors::CustomError;
use crate::events::{ContractInitialized, ContractStatusUpdated, ContractUpdated, ContractExecuted};

/// Smart city contract account
#[account]
pub struct Contract {
    pub name: String,          // 50 chars max
    pub description: String,   // 200 chars max
    pub contract_type: String, // 30 chars max
    pub authority: Pubkey,     // 32 bytes
    pub is_active: bool,       // 1 byte
    pub created_at: i64,       // 8 bytes
    pub updated_at: i64,       // 8 bytes
    pub version: u32,          // 4 bytes - for versioning
    pub execution_count: u32,  // 4 bytes - for tracking usage
}

impl Contract {
    pub const LEN: usize = 8 + // discriminator
        4 + 50 + // name (String)
        4 + 200 + // description (String)
        4 + 30 + // contract_type (String)
        32 + // authority (Pubkey)
        1 + // is_active (bool)
        8 + // created_at (i64)
        8 + // updated_at (i64)
        4 + // version (u32)
        4; // execution_count (u32)

    /// Validates contract input data
    pub fn validate_contract_data(
        name: &str,
        description: &str,
        contract_type: &str,
    ) -> Result<()> {
        require!(name.len() <= 50, CustomError::NameTooLong);
        require!(description.len() <= 200, CustomError::DescriptionTooLong);
        require!(contract_type.len() <= 30, CustomError::ContractTypeTooLong);
        require!(!name.is_empty(), CustomError::InvalidInput);
        require!(!contract_type.is_empty(), CustomError::InvalidInput);
        Ok(())
    }

    /// Updates contract with economic optimization
    pub fn update_contract(
        &mut self,
        name: Option<String>,
        description: Option<String>,
        contract_type: Option<String>,
    ) -> Result<bool> {
        let mut changed = false;

        if let Some(new_name) = name {
            if new_name != self.name {
                Self::validate_contract_data(&new_name, &self.description, &self.contract_type)?;
                self.name = new_name;
                changed = true;
            }
        }

        if let Some(new_description) = description {
            if new_description != self.description {
                Self::validate_contract_data(&self.name, &new_description, &self.contract_type)?;
                self.description = new_description;
                changed = true;
            }
        }

        if let Some(new_type) = contract_type {
            if new_type != self.contract_type {
                Self::validate_contract_data(&self.name, &self.description, &new_type)?;
                self.contract_type = new_type;
                changed = true;
            }
        }

        if changed {
            self.updated_at = Clock::get()?.unix_timestamp;
            self.version += 1;
        }

        Ok(changed)
    }

    /// Executes contract (increments usage counter)
    pub fn execute(&mut self) -> Result<()> {
        require!(self.is_active, CustomError::ContractInactive);
        self.execution_count += 1;
        self.updated_at = Clock::get()?.unix_timestamp;
        Ok(())
    }
}

/// Context for initializing a contract
#[derive(Accounts)]
#[instruction(name: String)]
pub struct InitializeContract<'info> {
    #[account(
        init,
        payer = authority,
        space = Contract::LEN,
        seeds = [b"contract", name.as_bytes(), authority.key().as_ref()],
        bump
    )]
    pub contract: Account<'info, Contract>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

/// Context for updating contract status
#[derive(Accounts)]
pub struct UpdateContract<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract: Account<'info, Contract>,
    
    pub authority: Signer<'info>,
}

/// Context for updating contract details
#[derive(Accounts)]
pub struct UpdateContractDetails<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract: Account<'info, Contract>,
    
    pub authority: Signer<'info>,
}

/// Context for executing a contract
#[derive(Accounts)]
pub struct ExecuteContract<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract: Account<'info, Contract>,
    
    pub authority: Signer<'info>,
}

/// Context for batch contract operations (economic optimization)
#[derive(Accounts)]
pub struct BatchContractOperation<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract_1: Account<'info, Contract>,
    
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub contract_2: Account<'info, Contract>,
    
    pub authority: Signer<'info>,
}

/// Contract instruction handlers
impl<'info> InitializeContract<'info> {
    pub fn process(
        &mut self,
        name: String,
        description: String,
        contract_type: String,
    ) -> Result<()> {
        Contract::validate_contract_data(&name, &description, &contract_type)?;

        let contract = &mut self.contract;
        contract.name = name.clone();
        contract.description = description.clone();
        contract.contract_type = contract_type.clone();
        contract.authority = self.authority.key();
        contract.is_active = true;
        contract.created_at = Clock::get()?.unix_timestamp;
        contract.updated_at = Clock::get()?.unix_timestamp;
        contract.version = 1;
        contract.execution_count = 0;
        
        emit!(ContractInitialized {
            contract: contract.key(),
            name,
            description,
            contract_type,
            authority: contract.authority,
        });
        
        Ok(())
    }
}

impl<'info> UpdateContract<'info> {
    pub fn process_status_update(&mut self, is_active: bool) -> Result<()> {
        let contract = &mut self.contract;
        
        // Economic optimization: only update if status actually changes
        if contract.is_active != is_active {
            contract.is_active = is_active;
            contract.updated_at = Clock::get()?.unix_timestamp;
            
            emit!(ContractStatusUpdated {
                contract: contract.key(),
                is_active,
                timestamp: contract.updated_at,
            });
        }
        
        Ok(())
    }
}

impl<'info> UpdateContractDetails<'info> {
    pub fn process(
        &mut self,
        name: Option<String>,
        description: Option<String>,
        contract_type: Option<String>,
    ) -> Result<()> {
        let contract = &mut self.contract;
        
        // Economic optimization: only emit event if something actually changed
        let changed = contract.update_contract(name.clone(), description.clone(), contract_type.clone())?;
        
        if changed {
            emit!(ContractUpdated {
                contract: contract.key(),
                name: name.unwrap_or(contract.name.clone()),
                description: description.unwrap_or(contract.description.clone()),
                contract_type: contract_type.unwrap_or(contract.contract_type.clone()),
                version: contract.version,
                timestamp: contract.updated_at,
            });
        }
        
        Ok(())
    }
}

impl<'info> ExecuteContract<'info> {
    pub fn process(&mut self) -> Result<()> {
        let contract = &mut self.contract;
        contract.execute()?;
        
        emit!(ContractExecuted {
            contract: contract.key(),
            execution_count: contract.execution_count,
            timestamp: contract.updated_at,
        });
        
        Ok(())
    }
}

impl<'info> BatchContractOperation<'info> {
    pub fn process_batch_status_update(
        &mut self,
        statuses: Vec<bool>,
    ) -> Result<()> {
        require!(statuses.len() <= 2, CustomError::InvalidInput);
        
        let mut contracts = [&mut self.contract_1, &mut self.contract_2];

        for (i, &is_active) in statuses.iter().enumerate() {
            if i < contracts.len() {
                let contract = &mut contracts[i];
                if contract.is_active != is_active {
                    contract.is_active = is_active;
                    contract.updated_at = Clock::get()?.unix_timestamp;
                    
                    emit!(ContractStatusUpdated {
                        contract: contract.key(),
                        is_active,
                        timestamp: contract.updated_at,
                    });
                }
            }
        }
        
        Ok(())
    }
}
