use core::str::FromStr;

use crate::TemperatureError;

/// Temperature scales supported by ThermoShift.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum Unit {
    Celsius,
    Fahrenheit,
    Kelvin,
    Rankine,
    Reaumur,
    Delisle,
    Newton,
    Romer,
}

impl Unit {
    pub const ALL: [Self; 8] = [
        Self::Celsius,
        Self::Fahrenheit,
        Self::Kelvin,
        Self::Rankine,
        Self::Reaumur,
        Self::Delisle,
        Self::Newton,
        Self::Romer,
    ];

    #[must_use]
    pub const fn id(self) -> &'static str {
        match self {
            Self::Celsius => "celsius",
            Self::Fahrenheit => "fahrenheit",
            Self::Kelvin => "kelvin",
            Self::Rankine => "rankine",
            Self::Reaumur => "reaumur",
            Self::Delisle => "delisle",
            Self::Newton => "newton",
            Self::Romer => "romer",
        }
    }

    #[must_use]
    pub const fn name(self) -> &'static str {
        match self {
            Self::Celsius => "Celsius",
            Self::Fahrenheit => "Fahrenheit",
            Self::Kelvin => "Kelvin",
            Self::Rankine => "Rankine",
            Self::Reaumur => "Réaumur",
            Self::Delisle => "Delisle",
            Self::Newton => "Newton",
            Self::Romer => "Rømer",
        }
    }

    #[must_use]
    pub const fn symbol(self) -> &'static str {
        match self {
            Self::Celsius => "°C",
            Self::Fahrenheit => "°F",
            Self::Kelvin => "K",
            Self::Rankine => "°R",
            Self::Reaumur => "°Ré",
            Self::Delisle => "°De",
            Self::Newton => "°N",
            Self::Romer => "°Rø",
        }
    }
}

impl FromStr for Unit {
    type Err = TemperatureError;

    fn from_str(value: &str) -> Result<Self, Self::Err> {
        let normalized = value.trim().to_lowercase();
        match normalized.as_str() {
            "celsius" | "c" | "°c" => Ok(Self::Celsius),
            "fahrenheit" | "f" | "°f" => Ok(Self::Fahrenheit),
            "kelvin" | "k" => Ok(Self::Kelvin),
            "rankine" | "r" | "°r" => Ok(Self::Rankine),
            "reaumur" | "réaumur" | "re" | "ré" | "°ré" => Ok(Self::Reaumur),
            "delisle" | "de" | "°de" => Ok(Self::Delisle),
            "newton" | "n" | "°n" => Ok(Self::Newton),
            "romer" | "rømer" | "ro" | "rø" | "°rø" => Ok(Self::Romer),
            _ => Err(TemperatureError::UnknownUnit(value.to_owned())),
        }
    }
}
