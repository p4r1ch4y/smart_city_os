use crate::CustomError;
// PDA seed conversion helpers
pub fn location_seed(location: &str) -> [u8; 11] {
    let mut loc_bytes = [0u8; 11];
    let src = location.as_bytes();
    let len = src.len().min(11);
    loc_bytes[..len].copy_from_slice(&src[..len]);
    loc_bytes
}
//

pub fn sensor_id_seed(sensor_id: &str) -> [u8; 11] {
    let mut sensor_bytes = [0u8; 11];
    let src = sensor_id.as_bytes();
    let len = src.len().min(11);
    sensor_bytes[..len].copy_from_slice(&src[..len]);
    sensor_bytes
}
use anchor_lang::prelude::*;

#[derive(Accounts)]
#[instruction(location: String, sensor_id: String)]
pub struct InitializeAirQuality<'info> {
    // PDA seeds prepared outside macro for correct lifetimes
    #[account(
        init,
        payer = authority,
        space = AirQuality::LEN,
        seeds = [b"air_quality", &location_seed(&location), &sensor_id_seed(&sensor_id)],
        bump
    )]
    //

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