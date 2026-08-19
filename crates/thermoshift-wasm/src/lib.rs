use core::str::FromStr;

use thermoshift_core::{Unit, absolute_zero_in, convert};
use wasm_bindgen::prelude::*;

fn parse_unit(value: &str) -> Result<Unit, JsValue> {
    Unit::from_str(value).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn convert_temperature(value: f64, from: &str, to: &str) -> Result<f64, JsValue> {
    let from = parse_unit(from)?;
    let to = parse_unit(to)?;
    convert(value, from, to).map_err(|error| JsValue::from_str(&error.to_string()))
}

#[wasm_bindgen]
pub fn absolute_zero_for(unit: &str) -> Result<f64, JsValue> {
    Ok(absolute_zero_in(parse_unit(unit)?))
}

#[wasm_bindgen]
pub fn engine_version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}
