use anchor_lang::prelude::*;

declare_id!("H7i6MP76Ex1iF7ET6pbUUB8a7w9uF2WRkeXosa6yZqAR");

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
        air_quality.aqi = 0;
        air_quality.pm25 = 0.0;
        air_quality.pm10 = 0.0;
        air_quality.co2 = 0.0;
        air_quality.humidity = 0.0;
        air_quality.temperature = 0.0;
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
        space = 8 + 4 + 50 + 4 + 30 + 32 + 2 + 4 + 4 + 4 + 4 + 4 + 8 + 8,
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
        has_one = authority,
        seeds = [b"air_quality", air_quality.location.as_bytes(), air_quality.sensor_id.as_bytes()],
        bump
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
        space = 8 + 4 + 50 + 4 + 200 + 4 + 30 + 32 + 1 + 8 + 8,
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
        has_one = authority,
        seeds = [b"contract", contract.name.as_bytes(), authority.key().as_ref()],
        bump
    )]
    pub contract: Account<'info, Contract>,
    pub authority: Signer<'info>,
}

#[account]
pub struct AirQuality {
    pub location: String,
    pub sensor_id: String,
    pub authority: Pubkey,
    pub aqi: u16,
    pub pm25: f32,
    pub pm10: f32,
    pub co2: f32,
    pub humidity: f32,
    pub temperature: f32,
    pub created_at: i64,
    pub updated_at: i64,
}

#[account]
pub struct Contract {
    pub name: String,
    pub description: String,
    pub contract_type: String,
    pub authority: Pubkey,
    pub is_active: bool,
    pub created_at: i64,
    pub updated_at: i64,
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
