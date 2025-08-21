use anchor_lang::prelude::*;

/// Economic optimization utilities
pub struct EconomicOptimizer;

impl EconomicOptimizer {
    /// Calculates if a percentage change meets the threshold for blockchain update
    pub fn meets_percentage_threshold(old_value: f32, new_value: f32, threshold: f32) -> bool {
        if old_value == 0.0 {
            return new_value != 0.0;
        }
        let change_percentage = ((new_value - old_value).abs() / old_value.abs()) * 100.0;
        change_percentage >= threshold
    }

    /// Calculates if an absolute change meets the threshold
    pub fn meets_absolute_threshold(old_value: f32, new_value: f32, threshold: f32) -> bool {
        (new_value - old_value).abs() >= threshold
    }

    /// Determines if enough time has passed to force an update regardless of change
    pub fn meets_time_threshold(last_update: i64, threshold_seconds: i64) -> bool {
        let current_time = Clock::get().unwrap().unix_timestamp;
        (current_time - last_update) >= threshold_seconds
    }

    /// Calculates the economic score for an update (higher score = more important)
    pub fn calculate_update_priority(
        aqi_change: f32,
        pm25_change: f32,
        pm10_change: f32,
        co2_change: f32,
        humidity_change: f32,
        temp_change: f32,
        time_since_update: i64,
    ) -> u32 {
        let mut score = 0u32;

        // AQI changes are most critical (weight: 10)
        if aqi_change > 10.0 { score += 100; }
        else if aqi_change > 5.0 { score += 50; }
        else if aqi_change > 2.0 { score += 20; }

        // PM2.5 changes are very important (weight: 8)
        if pm25_change > 15.0 { score += 80; }
        else if pm25_change > 10.0 { score += 40; }
        else if pm25_change > 5.0 { score += 16; }

        // PM10 changes are important (weight: 6)
        if pm10_change > 20.0 { score += 60; }
        else if pm10_change > 15.0 { score += 30; }
        else if pm10_change > 10.0 { score += 12; }

        // CO2 changes are moderately important (weight: 4)
        if co2_change > 100.0 { score += 40; }
        else if co2_change > 50.0 { score += 20; }
        else if co2_change > 25.0 { score += 8; }

        // Humidity changes are less critical (weight: 2)
        if humidity_change > 20.0 { score += 20; }
        else if humidity_change > 10.0 { score += 10; }
        else if humidity_change > 5.0 { score += 4; }

        // Temperature changes are less critical (weight: 3)
        if temp_change > 10.0 { score += 30; }
        else if temp_change > 5.0 { score += 15; }
        else if temp_change > 2.0 { score += 6; }

        // Time factor - force updates after long periods
        if time_since_update > 86400 { score += 100; } // 24 hours
        else if time_since_update > 43200 { score += 50; } // 12 hours
        else if time_since_update > 21600 { score += 25; } // 6 hours

        score
    }

    /// Determines if an update should proceed based on economic thresholds
    /// Returns true if the update is economically justified
    pub fn should_update(
        old_aqi: u16,
        new_aqi: u16,
        old_pm25: f32,
        new_pm25: f32,
        old_pm10: f32,
        new_pm10: f32,
        old_co2: f32,
        new_co2: f32,
        old_humidity: f32,
        new_humidity: f32,
        old_temp: f32,
        new_temp: f32,
        last_update: i64,
        minimum_score: u32,
    ) -> bool {
        let aqi_change = (new_aqi as f32 - old_aqi as f32).abs();
        let pm25_change = (new_pm25 - old_pm25).abs();
        let pm10_change = (new_pm10 - old_pm10).abs();
        let co2_change = (new_co2 - old_co2).abs();
        let humidity_change = (new_humidity - old_humidity).abs();
        let temp_change = (new_temp - old_temp).abs();
        let time_since_update = Clock::get().unwrap().unix_timestamp - last_update;

        let priority_score = Self::calculate_update_priority(
            aqi_change,
            pm25_change,
            pm10_change,
            co2_change,
            humidity_change,
            temp_change,
            time_since_update,
        );

        priority_score >= minimum_score
    }
}

/// Validation utilities
pub struct ValidationUtils;

impl ValidationUtils {
    /// Validates string length and content
    pub fn validate_string(value: &str, max_length: usize, _field_name: &str) -> Result<()> {
        require!(
            value.len() <= max_length,
            crate::errors::CustomError::InvalidInput
        );
        require!(
            !value.trim().is_empty(),
            crate::errors::CustomError::InvalidInput
        );
        Ok(())
    }

    /// Validates numeric ranges
    pub fn validate_range<T: PartialOrd + Copy>(
        value: T,
        min: T,
        max: T,
        _error: crate::errors::CustomError,
    ) -> Result<()> {
        if value >= min && value <= max {
            Ok(())
        } else {
            Err(crate::errors::CustomError::InvalidInput.into())
        }
    }

    /// Validates air quality sensor data in batch
    pub fn validate_air_quality_batch(
        data: &[(u16, f32, f32, f32, f32, f32)],
    ) -> Result<()> {
        for (aqi, pm25, pm10, co2, humidity, temperature) in data {
            crate::air_quality::AirQuality::validate_sensor_data(
                *aqi, *pm25, *pm10, *co2, *humidity, *temperature
            )?;
        }
        Ok(())
    }
}

/// Gas optimization utilities
pub struct GasOptimizer;

impl GasOptimizer {
    /// Estimates the gas cost for different operations
    pub fn estimate_operation_cost(operation_type: &str, data_size: usize) -> u64 {
        match operation_type {
            "initialize_air_quality" => 5000 + (data_size as u64 * 10),
            "update_air_quality" => 3000 + (data_size as u64 * 5),
            "batch_update_air_quality" => 2000 + (data_size as u64 * 15), // More efficient per item
            "initialize_contract" => 6000 + (data_size as u64 * 12),
            "update_contract" => 3500 + (data_size as u64 * 8),
            "batch_contract_operation" => 2500 + (data_size as u64 * 18),
            _ => 5000, // Default estimate
        }
    }

    /// Determines optimal batch size for operations
    pub fn optimal_batch_size(operation_type: &str) -> usize {
        match operation_type {
            "air_quality_update" => 3, // Sweet spot for air quality updates
            "contract_operation" => 2,  // Optimal for contract operations
            _ => 1,
        }
    }

    /// Calculates if batching would be more economical
    pub fn should_batch(operation_count: usize, operation_type: &str) -> bool {
        let optimal_size = Self::optimal_batch_size(operation_type);
        operation_count >= optimal_size
    }
}
