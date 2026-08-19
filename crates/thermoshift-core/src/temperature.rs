use crate::{TemperatureError, Unit};

const ABSOLUTE_ZERO_K: f64 = 0.0;
const VALIDATION_EPSILON_K: f64 = 1.0e-10;

#[derive(Debug, Clone, Copy, PartialEq)]
pub struct Temperature {
    kelvin: f64,
}

impl Temperature {
    /// Creates a validated temperature from a value and scale.
    pub fn new(value: f64, unit: Unit) -> Result<Self, TemperatureError> {
        if !value.is_finite() {
            return Err(TemperatureError::NonFiniteInput);
        }

        let kelvin = to_kelvin_unchecked(value, unit);
        if kelvin < ABSOLUTE_ZERO_K - VALIDATION_EPSILON_K {
            return Err(TemperatureError::BelowAbsoluteZero {
                value,
                unit,
                minimum: absolute_zero_in(unit),
            });
        }

        Ok(Self {
            kelvin: if kelvin.abs() <= VALIDATION_EPSILON_K {
                0.0
            } else {
                kelvin
            },
        })
    }

    #[must_use]
    pub fn as_unit(self, unit: Unit) -> f64 {
        from_kelvin(self.kelvin, unit)
    }

    #[must_use]
    pub const fn kelvin(self) -> f64 {
        self.kelvin
    }
}

pub fn convert(value: f64, from: Unit, to: Unit) -> Result<f64, TemperatureError> {
    Temperature::new(value, from).map(|temperature| temperature.as_unit(to))
}

#[must_use]
pub fn absolute_zero_in(unit: Unit) -> f64 {
    from_kelvin(ABSOLUTE_ZERO_K, unit)
}

fn to_kelvin_unchecked(value: f64, unit: Unit) -> f64 {
    match unit {
        Unit::Celsius => value + 273.15,
        Unit::Fahrenheit => (value + 459.67) * 5.0 / 9.0,
        Unit::Kelvin => value,
        Unit::Rankine => value * 5.0 / 9.0,
        Unit::Reaumur => value * 5.0 / 4.0 + 273.15,
        Unit::Delisle => 373.15 - value * 2.0 / 3.0,
        Unit::Newton => value * 100.0 / 33.0 + 273.15,
        Unit::Romer => (value - 7.5) * 40.0 / 21.0 + 273.15,
    }
}

fn from_kelvin(kelvin: f64, unit: Unit) -> f64 {
    match unit {
        Unit::Celsius => kelvin - 273.15,
        Unit::Fahrenheit => kelvin * 9.0 / 5.0 - 459.67,
        Unit::Kelvin => kelvin,
        Unit::Rankine => kelvin * 9.0 / 5.0,
        Unit::Reaumur => (kelvin - 273.15) * 4.0 / 5.0,
        Unit::Delisle => (373.15 - kelvin) * 3.0 / 2.0,
        Unit::Newton => (kelvin - 273.15) * 33.0 / 100.0,
        Unit::Romer => (kelvin - 273.15) * 21.0 / 40.0 + 7.5,
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn approx_eq(left: f64, right: f64) {
        let tolerance = 1.0e-9_f64.max(right.abs() * 1.0e-12);
        assert!(
            (left - right).abs() <= tolerance,
            "expected {left} ≈ {right} (tolerance {tolerance})"
        );
    }

    #[test]
    fn canonical_reference_points_are_correct() {
        approx_eq(convert(0.0, Unit::Celsius, Unit::Fahrenheit).unwrap(), 32.0);
        approx_eq(convert(100.0, Unit::Celsius, Unit::Kelvin).unwrap(), 373.15);
        approx_eq(convert(32.0, Unit::Fahrenheit, Unit::Celsius).unwrap(), 0.0);
        approx_eq(convert(491.67, Unit::Rankine, Unit::Celsius).unwrap(), 0.0);
        approx_eq(convert(80.0, Unit::Reaumur, Unit::Celsius).unwrap(), 100.0);
        approx_eq(convert(0.0, Unit::Delisle, Unit::Celsius).unwrap(), 100.0);
        approx_eq(convert(33.0, Unit::Newton, Unit::Celsius).unwrap(), 100.0);
        approx_eq(convert(7.5, Unit::Romer, Unit::Celsius).unwrap(), 0.0);
    }

    #[test]
    fn every_scale_round_trips_across_every_other_scale() {
        let samples = [0.0, 1.0, 37.0, 100.0, 273.15, 1000.0];
        for source in Unit::ALL {
            for target in Unit::ALL {
                for kelvin in samples {
                    let source_value = from_kelvin(kelvin, source);
                    let target_value = convert(source_value, source, target).unwrap();
                    let round_trip = convert(target_value, target, source).unwrap();
                    approx_eq(round_trip, source_value);
                }
            }
        }
    }

    #[test]
    fn absolute_zero_is_valid_on_all_scales() {
        for unit in Unit::ALL {
            let minimum = absolute_zero_in(unit);
            approx_eq(convert(minimum, unit, Unit::Kelvin).unwrap(), 0.0);
        }
    }

    #[test]
    fn values_below_absolute_zero_are_rejected() {
        for unit in Unit::ALL {
            let minimum = absolute_zero_in(unit);
            let error = Temperature::new(minimum - 0.001, unit).unwrap_err();
            assert!(matches!(error, TemperatureError::BelowAbsoluteZero { .. }));
        }
    }

    #[test]
    fn non_finite_values_are_rejected() {
        for value in [f64::NAN, f64::INFINITY, f64::NEG_INFINITY] {
            assert_eq!(
                Temperature::new(value, Unit::Kelvin).unwrap_err(),
                TemperatureError::NonFiniteInput
            );
        }
    }
}
