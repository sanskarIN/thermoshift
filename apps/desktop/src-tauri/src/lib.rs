use core::str::FromStr;

use tauri::Manager;
use thermoshift_core::{Unit, absolute_zero_in, convert};

#[tauri::command]
fn convert_temperature(value: f64, from: &str, to: &str) -> Result<f64, String> {
    let from = Unit::from_str(from).map_err(|error| error.to_string())?;
    let to = Unit::from_str(to).map_err(|error| error.to_string())?;
    convert(value, from, to).map_err(|error| error.to_string())
}

#[tauri::command]
fn absolute_zero_for(unit: &str) -> Result<f64, String> {
    let unit = Unit::from_str(unit).map_err(|error| error.to_string())?;
    Ok(absolute_zero_in(unit))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            if let Some(window) = app.get_webview_window("main") {
                window.set_title("ThermoShift")?;
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![convert_temperature, absolute_zero_for])
        .run(tauri::generate_context!())
        .expect("ThermoShift native runtime failed");
}
