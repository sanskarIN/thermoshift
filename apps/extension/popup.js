import init, {
  absolute_zero_for,
  convert_temperature,
  engine_version,
} from './generated/thermoshift_wasm.js';

const UNITS = [
  ['celsius', 'Celsius', '°C'],
  ['fahrenheit', 'Fahrenheit', '°F'],
  ['kelvin', 'Kelvin', 'K'],
  ['rankine', 'Rankine', '°R'],
  ['reaumur', 'Réaumur', '°Ré'],
  ['delisle', 'Delisle', '°De'],
  ['newton', 'Newton', '°N'],
  ['romer', 'Rømer', '°Rø'],
];

const converterForm = document.querySelector('#converter');
const valueInput = document.querySelector('#value');
const fromSelect = document.querySelector('#from-unit');
const toSelect = document.querySelector('#to-unit');
const swapButton = document.querySelector('#swap');
const resultOutput = document.querySelector('#result');
const errorOutput = document.querySelector('#error');
const versionOutput = document.querySelector('#engine-version');

function populateUnits(select) {
  for (const [id, name, symbol] of UNITS) {
    const option = document.createElement('option');
    option.value = id;
    option.textContent = `${name} (${symbol})`;
    select.append(option);
  }
}

function unitSymbol(id) {
  return UNITS.find(([unitId]) => unitId === id)?.[2] ?? id;
}

function formatNumber(value) {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 8,
    useGrouping: false,
  }).format(value);
}

function showError(message, inputInvalid = false) {
  errorOutput.textContent = message;
  errorOutput.hidden = false;
  resultOutput.textContent = 'Conversion unavailable';
  valueInput.toggleAttribute('aria-invalid', inputInvalid);
}

function clearError() {
  errorOutput.textContent = '';
  errorOutput.hidden = true;
  valueInput.removeAttribute('aria-invalid');
}

function convert() {
  clearError();
  const rawValue = valueInput.value.trim();
  if (rawValue === '') {
    resultOutput.textContent = 'Enter a temperature to convert.';
    return;
  }

  const value = Number(rawValue);
  if (!Number.isFinite(value)) {
    showError('Enter a finite numeric value.', true);
    return;
  }

  try {
    const converted = convert_temperature(value, fromSelect.value, toSelect.value);
    resultOutput.textContent = `${formatNumber(value)} ${unitSymbol(fromSelect.value)} = ${formatNumber(converted)} ${unitSymbol(toSelect.value)}`;
  } catch (error) {
    try {
      const absoluteZero = absolute_zero_for(fromSelect.value);
      showError(`Value is outside the physical range for ${fromSelect.selectedOptions[0]?.textContent ?? 'this scale'}. Absolute zero is ${formatNumber(absoluteZero)} ${unitSymbol(fromSelect.value)}.`, true);
    } catch {
      showError('ThermoShift could not validate this conversion.', true);
    }
    console.debug('ThermoShift conversion rejected input', error);
  }
}

function swapUnits() {
  const previousFrom = fromSelect.value;
  fromSelect.value = toSelect.value;
  toSelect.value = previousFrom;
  convert();
}

async function start() {
  populateUnits(fromSelect);
  populateUnits(toSelect);
  fromSelect.value = 'celsius';
  toSelect.value = 'fahrenheit';

  try {
    await init();
    versionOutput.textContent = `Engine ${engine_version()}`;
    valueInput.addEventListener('input', convert);
    fromSelect.addEventListener('change', convert);
    toSelect.addEventListener('change', convert);
    swapButton.addEventListener('click', swapUnits);
    converterForm.addEventListener('submit', (event) => {
      event.preventDefault();
      convert();
    });
    convert();
  } catch (error) {
    showError('ThermoShift could not load its local conversion engine.');
    console.error('ThermoShift extension initialization failed', error);
  }
}

void start();
