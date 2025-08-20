use anchor_lang::prelude::*;

declare_id!("7jGiTQRkU66HczW2rSBDYbvnvMPxtsVYR72vpa9a7qF2");

#[program]
pub mod civic_ledger {
    use super::*;

    pub fn initialize_air_quality(
        ctx: Context<InitializeAirQuality>,
        location: String,
        sensor_id: String,
    ) -> Result<()> {
        let air_quality = &mut ctx.accounts.air_quality;
        air_quality.location = location;
        air_quality.sensor_id = sensor_id;
        air_quality.authority = ctx.accounts.authority.key();
        air_quality.created_at = Clock::get()?.unix_timestamp;
        air_quality.updated_at = Clock::get()?.unix_timestamp;
        emit!(AirQualityInitialized {
            air_quality: air_quality.key(),
            location: air_quality.location.clone(),
            sensor_id: air_quality.sensor_id.clone(),
            authority: air_quality.authority,
        });
        Ok(())
    }

    pub fn update_air_quality(
        ctx: Context<UpdateAirQuality>,
        aqi: u16,
        pm25: f32,
        pm10: f32,
        co2: f32,
        humidity: f32,
        temperature: f32,
    ) -> Result<()> {
        // Validate input ranges for sensor data
        require!(aqi <= 500, CustomError::InvalidAQIValue);
        require!(pm25 >= 0.0 && pm25 <= 1000.0, CustomError::InvalidPM25Value);
        require!(pm10 >= 0.0 && pm10 <= 1000.0, CustomError::InvalidPM10Value);
        require!(co2 >= 0.0 && co2 <= 10000.0, CustomError::InvalidCO2Value);
        require!(humidity >= 0.0 && humidity <= 100.0, CustomError::InvalidHumidityValue);
        require!(temperature >= -50.0 && temperature <= 100.0, CustomError::InvalidTemperatureValue);

        let air_quality = &mut ctx.accounts.air_quality;
        air_quality.aqi = aqi;
        air_quality.pm25 = pm25;
        air_quality.pm10 = pm10;
        air_quality.co2 = co2;
        air_quality.humidity = humidity;
        air_quality.temperature = temperature;
        air_quality.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(AirQualityUpdated {
            air_quality: air_quality.key(),
            aqi,
            pm25,
            pm10,
            co2,
            humidity,
            temperature,
            timestamp: air_quality.updated_at,
        });
        
        Ok(())
    }

    pub fn initialize_contract(
        ctx: Context<InitializeContract>,
        name: String,
        description: String,
        contract_type: String,
    ) -> Result<()> {
        require!(name.len() <= 50, CustomError::NameTooLong);
        require!(description.len() <= 200, CustomError::DescriptionTooLong);
        require!(contract_type.len() <= 30, CustomError::ContractTypeTooLong);

        let contract = &mut ctx.accounts.contract;
        contract.name = name;
        contract.description = description;
        contract.contract_type = contract_type;
        contract.authority = ctx.accounts.authority.key();
        contract.is_active = true;
        contract.created_at = Clock::get()?.unix_timestamp;
        contract.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(ContractInitialized {
            contract: contract.key(),
            name: contract.name.clone(),
            description: contract.description.clone(),
            contract_type: contract.contract_type.clone(),
            authority: contract.authority,
        });
        
        Ok(())
    }

    pub fn update_contract_status(
        ctx: Context<UpdateContract>,
        is_active: bool,
    ) -> Result<()> {
        let contract = &mut ctx.accounts.contract;
        contract.is_active = is_active;
        contract.updated_at = Clock::get()?.unix_timestamp;
        
        emit!(ContractStatusUpdated {
            contract: contract.key(),
            is_active,
            timestamp: contract.updated_at,
        });
        
        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(location: String, sensor_id: String)]
pub struct InitializeAirQuality<'info> {
    #[account(
        init,
        payer = authority,
        space = AirQuality::LEN,
        seeds = [b"air_quality", location.as_bytes(), sensor_id.as_bytes()],
        bump
    )]
    pub air_quality: Account<'info, AirQuality>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct UpdateAirQuality<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub air_quality: Account<'info, AirQuality>,
    
    pub authority: Signer<'info>,
}

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
pub struct AirQuality {
    pub location: String,      // 50 chars max
    pub sensor_id: String,     // 30 chars max
    pub authority: Pubkey,     // 32 bytes
    pub aqi: u16,              // 2 bytes
    pub pm25: f32,             // 4 bytes
    pub pm10: f32,             // 4 bytes
    pub co2: f32,              // 4 bytes
    pub humidity: f32,         // 4 bytes
    pub temperature: f32,      // 4 bytes
    pub created_at: i64,       // 8 bytes
    pub updated_at: i64,       // 8 bytes
}

impl AirQuality {
    pub const LEN: usize = 8 + // discriminator
        4 + 50 + // location (String)
        4 + 30 + // sensor_id (String)
        32 + // authority (Pubkey)
        2 + // aqi (u16)
        4 + // pm25 (f32)
        4 + // pm10 (f32)
        4 + // co2 (f32)
        4 + // humidity (f32)
        4 + // temperature (f32)
        8 + // created_at (i64)
        8; // updated_at (i64)
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


#[error_code]
pub enum CustomError {
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    #[msg("Invalid AQI value (must be 0-500)")]
    InvalidAQIValue,
    #[msg("Invalid PM2.5 value (must be 0-1000)")]
    InvalidPM25Value,
    #[msg("Invalid PM10 value (must be 0-1000)")]
    InvalidPM10Value,
    #[msg("Invalid CO2 value (must be 0-10000)")]
    InvalidCO2Value,
    #[msg("Invalid humidity value (must be 0-100)")]
    InvalidHumidityValue,
    #[msg("Invalid temperature value (must be -50 to 100)")]
    InvalidTemperatureValue,
    #[msg("Name too long (max 50 characters)")]
    NameTooLong,
    #[msg("Description too long (max 200 characters)")]
    DescriptionTooLong,
    #[msg("Contract type too long (max 30 characters)")]
    ContractTypeTooLong,
}

#[event]
pub struct AirQualityInitialized {
    pub air_quality: Pubkey,
    pub location: String,
    pub sensor_id: String,
    pub authority: Pubkey,
}

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