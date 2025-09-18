use anchor_lang::prelude::*;

declare_id!("A8vwRav21fjK55vLQXxDZD8WFLP5cvFyYfBaEsTcy5An");

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
        // Validate input ranges
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

    /// Update contract details with economic optimization
    ///
    /// Only updates if the details actually change
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    /// * `name` - Optional new name
    /// * `description` - Optional new description
    /// * `contract_type` - Optional new contract type
    pub fn update_contract_details(
        ctx: Context<UpdateContractDetails>,
        name: Option<String>,
        description: Option<String>,
        contract_type: Option<String>,
    ) -> Result<()> {
        ctx.accounts.process(name, description, contract_type)
    }

    /// Execute a contract (increment usage counter)
    ///
    /// # Arguments
    /// * `ctx` - The context containing accounts
    pub fn execute_contract(
        ctx: Context<ExecuteContract>,
    ) -> Result<()> {
        ctx.accounts.process()
    }

    /// Batch update contract statuses (economic optimization)
    ///
    /// More cost-effective than individual updates when updating multiple contracts
    ///
    /// # Arguments
    /// * `ctx` - The context containing multiple contract accounts
    /// * `statuses` - Vector of new status values
    pub fn batch_contract_status_update(
        ctx: Context<BatchContractOperation>,
        statuses: Vec<bool>,
    ) -> Result<()> {
        ctx.accounts.process_batch_status_update(statuses)
    }
}