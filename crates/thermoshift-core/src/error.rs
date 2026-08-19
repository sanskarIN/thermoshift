use core::fmt;

use crate::Unit;

/// Domain errors produced by the temperature conversion engine.
#[derive(Debug, Clone, PartialEq)]
pub enum TemperatureError {
    NonFiniteInput,
    BelowAbsoluteZero {
        value: f64,
        unit: Unit,
        minimum: f64,
    },
    UnknownUnit(String),
}

impl fmt::Display for TemperatureError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::NonFiniteInput => write!(f, "temperature must be a finite number"),
            Self::BelowAbsoluteZero {
                value,
                unit,
                minimum,
            } => write!(
                f,
                "{value} {} is below absolute zero ({minimum} {})",
                unit.symbol(),
                unit.symbol()
            ),
            Self::UnknownUnit(unit) => write!(f, "unknown temperature unit: {unit}"),
        }
    }
}

impl std::error::Error for TemperatureError {}
