use anchor_lang::prelude::*;

/// Custom error codes for the civic ledger program
#[error_code]
pub enum CustomError {
    #[msg("Unauthorized access")]
    UnauthorizedAccess,
    
    // Air Quality Validation Errors
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
    
    // Contract Validation Errors
    #[msg("Name too long (max 50 characters)")]
    NameTooLong,
    #[msg("Description too long (max 200 characters)")]
    DescriptionTooLong,
    #[msg("Contract type too long (max 30 characters)")]
    ContractTypeTooLong,
    #[msg("Contract is inactive")]
    ContractInactive,
    
    // General Validation Errors
    #[msg("Invalid input provided")]
    InvalidInput,
    #[msg("Operation not permitted")]
    OperationNotPermitted,
    #[msg("Account already exists")]
    AccountAlreadyExists,
    #[msg("Account not found")]
    AccountNotFound,
    #[msg("Insufficient permissions")]
    InsufficientPermissions,
    #[msg("Data validation failed")]
    DataValidationFailed,
    #[msg("Update threshold not met")]
    UpdateThresholdNotMet,
    #[msg("Batch operation limit exceeded")]
    BatchOperationLimitExceeded,
    #[msg("Economic threshold not met for update")]
    EconomicThresholdNotMet,
}
