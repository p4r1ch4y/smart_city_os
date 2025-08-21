use anchor_lang::prelude::*;
use crate::errors::CustomError;
use crate::events::{AirQualityInitialized, AirQualityUpdated};

/// Air Quality sensor data account
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
    pub update_count: u32,     // 4 bytes - for economic optimization
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
        8 + // updated_at (i64)
        4; // update_count (u32)

    /// Validates air quality sensor data ranges
    pub fn validate_sensor_data(
        aqi: u16,
        pm25: f32,
        pm10: f32,
        co2: f32,
        humidity: f32,
        temperature: f32,
    ) -> Result<()> {
        require!(aqi <= 500, CustomError::InvalidAQIValue);
        require!(pm25 >= 0.0 && pm25 <= 1000.0, CustomError::InvalidPM25Value);
        require!(pm10 >= 0.0 && pm10 <= 1000.0, CustomError::InvalidPM10Value);
        require!(co2 >= 0.0 && co2 <= 10000.0, CustomError::InvalidCO2Value);
        require!(humidity >= 0.0 && humidity <= 100.0, CustomError::InvalidHumidityValue);
        require!(temperature >= -50.0 && temperature <= 100.0, CustomError::InvalidTemperatureValue);
        Ok(())
    }

    /// Checks if the data change is significant enough to warrant a blockchain update
    /// This is a key economic optimization - only update if changes are meaningful
    pub fn is_significant_change(&self, aqi: u16, pm25: f32, pm10: f32, co2: f32, humidity: f32, temperature: f32) -> bool {
        let aqi_change = ((aqi as f32 - self.aqi as f32).abs() / self.aqi.max(1) as f32) > 0.05; // 5% change
        let pm25_change = ((pm25 - self.pm25).abs() / self.pm25.max(1.0)) > 0.1; // 10% change
        let pm10_change = ((pm10 - self.pm10).abs() / self.pm10.max(1.0)) > 0.1; // 10% change
        let co2_change = ((co2 - self.co2).abs() / self.co2.max(1.0)) > 0.05; // 5% change
        let humidity_change = (humidity - self.humidity).abs() > 5.0; // 5% absolute change
        let temp_change = (temperature - self.temperature).abs() > 2.0; // 2°C change

        // Update if any significant change OR if it's been more than 24 hours
        let time_threshold = Clock::get().unwrap().unix_timestamp - self.updated_at > 86400; // 24 hours
        
        aqi_change || pm25_change || pm10_change || co2_change || humidity_change || temp_change || time_threshold
    }

    /// Updates sensor data with validation and economic optimization
    pub fn update_data(
        &mut self,
        aqi: u16,
        pm25: f32,
        pm10: f32,
        co2: f32,
        humidity: f32,
        temperature: f32,
    ) -> Result<()> {
        // Validate input data
        Self::validate_sensor_data(aqi, pm25, pm10, co2, humidity, temperature)?;

        // Update the data
        self.aqi = aqi;
        self.pm25 = pm25;
        self.pm10 = pm10;
        self.co2 = co2;
        self.humidity = humidity;
        self.temperature = temperature;
        self.updated_at = Clock::get()?.unix_timestamp;
        self.update_count += 1;

        Ok(())
    }
}

/// Context for initializing air quality sensor
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

/// Context for updating air quality data
#[derive(Accounts)]
pub struct UpdateAirQuality<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub air_quality: Account<'info, AirQuality>,
    
    pub authority: Signer<'info>,
}

/// Context for batch updating multiple air quality sensors (economic optimization)
#[derive(Accounts)]
pub struct BatchUpdateAirQuality<'info> {
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub air_quality_1: Account<'info, AirQuality>,
    
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub air_quality_2: Account<'info, AirQuality>,
    
    #[account(
        mut,
        has_one = authority @ CustomError::UnauthorizedAccess
    )]
    pub air_quality_3: Account<'info, AirQuality>,
    
    pub authority: Signer<'info>,
}

/// Air quality instruction handlers
impl<'info> InitializeAirQuality<'info> {
    pub fn process(
        &mut self,
        location: String,
        sensor_id: String,
    ) -> Result<()> {
        // Validate input lengths for economic efficiency
        require!(location.len() <= 50, CustomError::NameTooLong);
        require!(sensor_id.len() <= 30, CustomError::NameTooLong);

        let air_quality = &mut self.air_quality;
        air_quality.location = location.clone();
        air_quality.sensor_id = sensor_id.clone();
        air_quality.authority = self.authority.key();
        air_quality.created_at = Clock::get()?.unix_timestamp;
        air_quality.updated_at = Clock::get()?.unix_timestamp;
        air_quality.update_count = 0;
        
        // Initialize with default safe values
        air_quality.aqi = 0;
        air_quality.pm25 = 0.0;
        air_quality.pm10 = 0.0;
        air_quality.co2 = 400.0; // Typical atmospheric CO2
        air_quality.humidity = 50.0;
        air_quality.temperature = 20.0;
        
        emit!(AirQualityInitialized {
            air_quality: air_quality.key(),
            location,
            sensor_id,
            authority: air_quality.authority,
        });
        
        Ok(())
    }
}

impl<'info> UpdateAirQuality<'info> {
    pub fn process(
        &mut self,
        aqi: u16,
        pm25: f32,
        pm10: f32,
        co2: f32,
        humidity: f32,
        temperature: f32,
    ) -> Result<()> {
        let air_quality = &mut self.air_quality;
        
        // Economic optimization: only update if change is significant
        if !air_quality.is_significant_change(aqi, pm25, pm10, co2, humidity, temperature) {
            msg!("Change not significant enough for blockchain update");
            return Ok(());
        }

        air_quality.update_data(aqi, pm25, pm10, co2, humidity, temperature)?;
        
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
}

/// Batch update for economic efficiency
impl<'info> BatchUpdateAirQuality<'info> {
    pub fn process(
        &mut self,
        sensor_data: Vec<(u16, f32, f32, f32, f32, f32)>, // (aqi, pm25, pm10, co2, humidity, temp)
    ) -> Result<()> {
        require!(sensor_data.len() <= 3, CustomError::InvalidInput);
        
        let mut sensors = [
            &mut self.air_quality_1,
            &mut self.air_quality_2,
            &mut self.air_quality_3,
        ];
        
        for (i, (aqi, pm25, pm10, co2, humidity, temperature)) in sensor_data.iter().enumerate() {
            if i < sensors.len() {
                let sensor = &mut sensors[i];
                if sensor.is_significant_change(*aqi, *pm25, *pm10, *co2, *humidity, *temperature) {
                    sensor.update_data(*aqi, *pm25, *pm10, *co2, *humidity, *temperature)?;
                    
                    emit!(AirQualityUpdated {
                        air_quality: sensor.key(),
                        aqi: *aqi,
                        pm25: *pm25,
                        pm10: *pm10,
                        co2: *co2,
                        humidity: *humidity,
                        temperature: *temperature,
                        timestamp: sensor.updated_at,
                    });
                }
            }
        }
        
        Ok(())
    }
}
