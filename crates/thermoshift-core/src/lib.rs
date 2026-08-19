//! Canonical temperature conversion domain engine for ThermoShift.
//!
//! All conversions flow through Kelvin and reject physically impossible
//! temperatures below absolute zero before producing output values.

mod error;
mod temperature;
mod unit;

pub use error::TemperatureError;
pub use temperature::{Temperature, absolute_zero_in, convert};
pub use unit::Unit;
