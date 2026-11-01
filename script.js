/**
 * @file script.js
 * @description Bin2Dec - Binary to Decimal Converter
 * Pure Vanilla JavaScript implementation with NO arrays and NO built-in parseInt(binary, 2).
 * Strictly complies with all constraints:
 * 1. No arrays used to store or process binary digits.
 * 2. No parseInt(binary, 2) used.
 * 3. Manual mathematical conversion using powers of 2 in a loop.
 * 4. Responsive UI event handling and real-time validation.
 */

// DOM Elements
const binaryInput = document.getElementById('binaryInput');
const decimalOutput = document.getElementById('decimalOutput');
const inputWrapper = document.getElementById('inputWrapper');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const bitCounter = document.getElementById('bitCounter');
const conversionStatus = document.getElementById('conversionStatus');
const breakdownContent = document.getElementById('breakdownContent');

const mode8BitBtn = document.getElementById('mode8Bit');
const modeVariableBtn = document.getElementById('modeVariable');
const registerSection = document.getElementById('registerSection');
const bitBoard = document.getElementById('bitBoard');

const clearInputBtn = document.getElementById('clearInputBtn');
const clearAllBtn = document.getElementById('clearAllBtn');
const pasteBtn = document.getElementById('pasteBtn');
const copyBtn = document.getElementById('copyBtn');
const copyBtnText = document.getElementById('copyBtnText');
const randomBtn = document.getElementById('randomBtn');

const pad0Btn = document.getElementById('pad0Btn');
const pad1Btn = document.getElementById('pad1Btn');
const padBackBtn = document.getElementById('padBackBtn');
const invertBtn = document.getElementById('invertBtn');
const presetChips = document.getElementById('presetChips');
const toast = document.getElementById('toast');

const hexValue = document.getElementById('hexValue');
const octValue = document.getElementById('octValue');
const activeBitsCount = document.getElementById('activeBitsCount');

// State variables (Strictly primitive values - NO ARRAYS)
let currentMode = '8bit'; // '8bit' or 'variable'
let toastTimeoutId = null;

/**
 * Validates a binary string digit by digit using a loop.
 * Strictly NO arrays used.
 * @param {string} rawString
 * @returns {{ isValid: boolean, isEmpty: boolean, errorChar: string, errorPos: number }}
 */
function validateBinary(rawString) {
  const len = rawString.length;

  if (len === 0) {
    return {
      isValid: true,
      isEmpty: true,
      errorChar: '',
      errorPos: 0
    };
  }

  for (let i = 0; i < len; i++) {
    const char = rawString.charAt(i);
    if (char !== '0' && char !== '1') {
      return {
        isValid: false,
        isEmpty: false,
        errorChar: char,
        errorPos: i + 1
      };
    }
  }

  return {
    isValid: true,
    isEmpty: false,
    errorChar: '',
    errorPos: 0
  };
}

/**
 * Manually calculates decimal value and mathematical breakdown from binary string.
 * Strictly NO arrays and NO parseInt(binary, 2).
 * Uses pure mathematical formula: Decimal = Sum(Digit * 2^(len - 1 - i)).
 * @param {string} binStr
 */
function calculateDecimalMathematically(binStr) {
  const len = binStr.length;

  if (len === 0) {
    return {
      decimalString: '',
      activeCount: 0,
      formulaHtml: '',
      valuesHtml: '',
      hexString: '0x0',
      octString: '0o0'
    };
  }

  // For inputs within standard precision (<= 53 bits)
  if (len <= 53) {
    let decimalTotal = 0;
    let activeBits = 0;
    let formulaHtml = '';
    let valuesHtml = '';

    for (let i = 0; i < len; i++) {
      const char = binStr.charAt(i);
      const isBitOne = char === '1';
      const digitNum = isBitOne ? 1 : 0;
      const power = len - 1 - i;
      const positionalValue = digitNum * Math.pow(2, power);

      decimalTotal = decimalTotal + positionalValue;

      if (isBitOne) {
        activeBits = activeBits + 1;
      }

      const isLast = i === len - 1;
      const termClass = isBitOne ? 'term-active' : 'term-zero';

      formulaHtml += '<span class="' + termClass + '">(' + char + ' × 2<sup>' + power + '</sup>)</span>';
      valuesHtml += '<span class="' + termClass + '">' + positionalValue + '</span>';

      if (!isLast) {
        formulaHtml += ' + ';
        valuesHtml += ' + ';
      }
    }

    return {
      decimalString: decimalTotal.toString(10),
      activeCount: activeBits,
      formulaHtml: formulaHtml,
      valuesHtml: valuesHtml,
      hexString: '0x' + decimalTotal.toString(16).toUpperCase(),
      octString: '0o' + decimalTotal.toString(8)
    };
  } else {
    // For large variable-length inputs (> 53 bits), use BigInt math to prevent numerical overflow
    let bigDecimalTotal = 0n;
    let activeBits = 0;
    let formulaHtml = '';
    let valuesHtml = '';

    for (let i = 0; i < len; i++) {
      const char = binStr.charAt(i);
      const isBitOne = char === '1';
      const digitBig = isBitOne ? 1n : 0n;
      const powerBig = BigInt(len - 1 - i);
      const powerVal = 2n ** powerBig;
      const positionalValue = digitBig * powerVal;

      bigDecimalTotal = bigDecimalTotal + positionalValue;

      if (isBitOne) {
        activeBits = activeBits + 1;
      }

      const isLast = i === len - 1;
      const termClass = isBitOne ? 'term-active' : 'term-zero';

      if (i < 12 || i >= len - 4) {
        formulaHtml += '<span class="' + termClass + '">(' + char + ' × 2<sup>' + powerBig.toString() + '</sup>)</span>';
        valuesHtml += '<span class="' + termClass + '">' + positionalValue.toString() + '</span>';
        if (!isLast) {
          formulaHtml += ' + ';
          valuesHtml += ' + ';
        }
      } else if (i === 12) {
        formulaHtml += ' + ... + ';
        valuesHtml += ' + ... + ';
      }
    }

    return {
      decimalString: bigDecimalTotal.toString(10),
      activeCount: activeBits,
      formulaHtml: formulaHtml,
      valuesHtml: valuesHtml,
      hexString: '0x' + bigDecimalTotal.toString(16).toUpperCase(),
      octString: '0o' + bigDecimalTotal.toString(8)
    };
  }
}

/**
 * Updates the 8-bit visual register board according to the current binary string.
 * Strictly NO arrays used.
 * @param {string} binStr
 * @param {boolean} isValid
 */
function updateBitBoard(binStr, isValid) {
  const len = binStr.length;

  for (let pos = 0; pos < 8; pos++) {
    const cell = document.querySelector('[data-bit-pos="' + pos + '"]');
    if (!cell) continue;

    const valSpan = cell.querySelector('.bit-val');

    if (!isValid || len === 0) {
      cell.classList.remove('active');
      if (valSpan) valSpan.textContent = '0';
      continue;
    }

    // Determine the character for this bit position
    // Bit 0 is the rightmost character (len - 1), Bit 1 is (len - 2), etc.
    const charIndex = len - 1 - pos;
    let bitChar = '0';

    if (charIndex >= 0 && charIndex < len) {
      bitChar = binStr.charAt(charIndex);
    }

    if (valSpan) {
      valSpan.textContent = bitChar;
    }

    if (bitChar === '1') {
      cell.classList.add('active');
    } else {
      cell.classList.remove('active');
    }
  }
}

/**
 * Updates character counter and max length warnings.
 */
function updateBitCounter(len) {
  if (currentMode === '8bit') {
    bitCounter.textContent = len + ' / 8 bits';
    if (len >= 8) {
      bitCounter.classList.add('at-limit');
    } else {
      bitCounter.classList.remove('at-limit');
    }
  } else {
    bitCounter.textContent = len + ' bits';
    bitCounter.classList.remove('at-limit');
  }
}

/**
 * Main conversion and validation orchestrator.
 * Triggered live on every keystroke, input change, or button click.
 */
function processConversion() {
  const rawInput = binaryInput.value.trim();
  const validation = validateBinary(rawInput);
  const len = rawInput.length;

  updateBitCounter(len);

  // Case 1: Empty input (Clean state, no errors)
  if (validation.isEmpty) {
    inputWrapper.classList.remove('has-error');
    errorMessage.classList.add('hidden');

    decimalOutput.value = '';
    decimalOutput.placeholder = '0';

    conversionStatus.textContent = 'Waiting for input';
    conversionStatus.className = 'status-badge';

    hexValue.textContent = '0x0';
    octValue.textContent = '0o0';
    activeBitsCount.textContent = '0';

    updateBitBoard('', true);

    breakdownContent.innerHTML =
      '<p class="breakdown-placeholder">Enter a binary number above to view the exact positional power-of-2 evaluation step by step.</p>';
    return;
  }

  // Case 2: Invalid input (Notify user of non-binary characters)
  if (!validation.isValid) {
    inputWrapper.classList.add('has-error');
    errorMessage.classList.remove('hidden');

    errorText.innerHTML =
      'You entered invalid character <strong>\'' +
      validation.errorChar +
      '\'</strong> at position ' +
      validation.errorPos +
      '. Only <strong>0</strong> and <strong>1</strong> are allowed.';

    decimalOutput.value = '';
    decimalOutput.placeholder = 'Invalid input';

    conversionStatus.textContent = 'Validation Error';
    conversionStatus.className = 'status-badge error';

    hexValue.textContent = '---';
    octValue.textContent = '---';
    activeBitsCount.textContent = '---';

    updateBitBoard('', false);

    breakdownContent.innerHTML =
      '<p class="breakdown-placeholder" style="color: #f87171;">Conversion paused: Please remove non-binary characters to evaluate mathematical steps.</p>';
    return;
  }

  // Case 3: Valid binary input -> Execute manual mathematical conversion
  inputWrapper.classList.remove('has-error');
  errorMessage.classList.add('hidden');

  const result = calculateDecimalMathematically(rawInput);

  decimalOutput.value = result.decimalString;

  conversionStatus.textContent = 'Converted (' + len + '-bit)';
  conversionStatus.className = 'status-badge converted';

  hexValue.textContent = result.hexString;
  octValue.textContent = result.octString;
  activeBitsCount.textContent = result.activeCount.toString();

  updateBitBoard(rawInput, true);

  // Render Step-by-Step Breakdown HTML without arrays
  let breakdownHtml = '<div class="breakdown-formula">';

  breakdownHtml += '<div class="formula-row">';
  breakdownHtml += '<span class="formula-label">1. Positional Powers of 2 Expression:</span>';
  breakdownHtml += '<div class="formula-expression">' + result.formulaHtml + '</div>';
  breakdownHtml += '</div>';

  breakdownHtml += '<div class="formula-row">';
  breakdownHtml += '<span class="formula-label">2. Evaluated Positional Terms:</span>';
  breakdownHtml += '<div class="formula-expression">' + result.valuesHtml + '</div>';
  breakdownHtml += '</div>';

  breakdownHtml += '<div class="formula-result-row">';
  breakdownHtml += '<span class="result-equals">=</span>';
  breakdownHtml += '<span class="result-highlight">' + result.decimalString + '</span>';
  breakdownHtml += '<span style="color: #64748b; font-size: 0.8rem;">(Base 10)</span>';
  breakdownHtml += '</div>';

  breakdownHtml += '</div>';

  breakdownContent.innerHTML = breakdownHtml;
}

/**
 * Sets binary input value, respecting active mode and max length.
 * @param {string} value
 */
function setBinaryValue(value) {
  let target = value;
  if (currentMode === '8bit' && target.length > 8) {
    target = target.substring(0, 8);
  }
  binaryInput.value = target;
  processConversion();
  binaryInput.focus();
}

/**
 * Appends a single binary digit (0 or 1).
 * @param {string} digit
 */
function appendDigit(digit) {
  if (currentMode === '8bit' && binaryInput.value.length >= 8) {
    showToast('Maximum 8 bits reached in 8-Bit mode.');
    return;
  }
  binaryInput.value += digit;
  processConversion();
  binaryInput.focus();
}

/**
 * Handles backspace deletion of the last character.
 */
function backspaceDigit() {
  const current = binaryInput.value;
  if (current.length > 0) {
    binaryInput.value = current.substring(0, current.length - 1);
    processConversion();
  }
  binaryInput.focus();
}

/**
 * Inverts all binary bits currently in the input (NOT operation: 0 ⇄ 1).
 * Strictly NO arrays used.
 */
function invertCurrentBits() {
  const current = binaryInput.value;
  if (current.length === 0) {
    showToast('Input is empty. Enter binary digits to invert.');
    return;
  }

  let inverted = '';
  for (let i = 0; i < current.length; i++) {
    const char = current.charAt(i);
    if (char === '0') {
      inverted += '1';
    } else if (char === '1') {
      inverted += '0';
    } else {
      inverted += char;
    }
  }

  binaryInput.value = inverted;
  processConversion();
  showToast('Inverted bits (0 ⇄ 1)');
}

/**
 * Toggles a bit at a specific power-of-2 position (0 to 7) on the 8-bit board.
 * Strictly NO arrays used.
 * @param {number} bitPos
 */
function toggleBitAtPosition(bitPos) {
  let current = binaryInput.value.trim();

  // If input contains invalid characters, clear them first
  const validation = validateBinary(current);
  if (!validation.isValid) {
    current = '';
  }

  // Ensure an 8-character string representation for 8-bit manipulation
  let padded = '';
  const neededZeros = 8 - current.length;

  if (neededZeros > 0) {
    for (let z = 0; z < neededZeros; z++) {
      padded += '0';
    }
    padded += current;
  } else if (current.length > 8) {
    padded = current.substring(current.length - 8);
  } else {
    padded = current;
  }

  // Bit 7 is index 0, Bit 0 is index 7
  const targetIndex = 7 - bitPos;
  let newPadded = '';

  for (let i = 0; i < 8; i++) {
    if (i === targetIndex) {
      const currentChar = padded.charAt(i);
      newPadded += currentChar === '1' ? '0' : '1';
    } else {
      newPadded += padded.charAt(i);
    }
  }

  // Trim leading zeros unless it represents single 0
  let startIndex = 0;
  while (startIndex < 7 && newPadded.charAt(startIndex) === '0') {
    startIndex++;
  }
  const cleanResult = newPadded.substring(startIndex);

  setBinaryValue(cleanResult);
}

/**
 * Generates a random valid 8-bit binary number.
 * Strictly NO arrays used.
 */
function generateRandom8Bit() {
  let randomBin = '';
  // Generate random length between 4 and 8
  const randLength = 4 + Math.floor(Math.random() * 5);

  for (let i = 0; i < randLength; i++) {
    // First digit is always 1 to avoid meaningless leading 0
    if (i === 0) {
      randomBin += '1';
    } else {
      randomBin += Math.random() >= 0.5 ? '1' : '0';
    }
  }

  setBinaryValue(randomBin);
  showToast('Generated random ' + randLength + '-bit binary!');
}

/**
 * Switches between 8-bit mode (Byte) and Variable-length mode.
 * @param {string} mode
 */
function switchMode(mode) {
  currentMode = mode;

  if (mode === '8bit') {
    mode8BitBtn.classList.add('active');
    mode8BitBtn.setAttribute('aria-checked', 'true');
    modeVariableBtn.classList.remove('active');
    modeVariableBtn.setAttribute('aria-checked', 'false');

    binaryInput.maxLength = 8;
    binaryInput.placeholder = 'e.g. 101101 (Max 8 bits)';

    // If current value is longer than 8, trim it
    if (binaryInput.value.length > 8) {
      binaryInput.value = binaryInput.value.substring(0, 8);
      showToast('Trimmed input to 8 bits for 8-Bit mode.');
    }
  } else {
    modeVariableBtn.classList.add('active');
    modeVariableBtn.setAttribute('aria-checked', 'true');
    mode8BitBtn.classList.remove('active');
    mode8BitBtn.setAttribute('aria-checked', 'false');

    binaryInput.removeAttribute('maxlength');
    binaryInput.placeholder = 'Enter variable length binary...';
    showToast('Variable length mode enabled (unlimited bits).');
  }

  processConversion();
}

/**
 * Displays a toast notification.
 * @param {string} message
 */
function showToast(message) {
  if (toastTimeoutId) {
    clearTimeout(toastTimeoutId);
  }
  toast.textContent = message;
  toast.classList.add('show');
  toastTimeoutId = setTimeout(function () {
    toast.classList.remove('show');
    toastTimeoutId = null;
  }, 2400);
}

/**
 * Copies the decimal result to clipboard.
 */
async function copyDecimalResult() {
  const val = decimalOutput.value;
  if (!val || val === 'Invalid input') {
    showToast('No valid decimal result to copy.');
    return;
  }

  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(val);
    } else {
      // Fallback
      decimalOutput.select();
      document.execCommand('copy');
    }

    copyBtn.classList.add('copied');
    copyBtnText.textContent = 'Copied!';
    showToast('Copied decimal ' + val + ' to clipboard!');

    setTimeout(function () {
      copyBtn.classList.remove('copied');
      copyBtnText.textContent = 'Copy';
    }, 2000);
  } catch (err) {
    showToast('Failed to copy to clipboard.');
  }
}

/**
 * Pastes binary from clipboard into the input.
 */
async function pasteFromClipboard() {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text) {
        setBinaryValue(text.trim());
        showToast('Pasted from clipboard.');
      }
    } else {
      binaryInput.focus();
      showToast('Please press Ctrl+V to paste.');
    }
  } catch (err) {
    binaryInput.focus();
    showToast('Please press Ctrl+V to paste.');
  }
}

/**
 * Clears both input and output fields, resetting application state.
 */
function resetAllFields() {
  binaryInput.value = '';
  processConversion();
  binaryInput.focus();
  showToast('Reset converter fields.');
}

// ==========================================
// Event Listeners Initialization
// ==========================================

// Real-time instant conversion on input
binaryInput.addEventListener('input', processConversion);

// Visual focus state handling
binaryInput.addEventListener('focus', function () {
  inputWrapper.classList.add('focus');
});
binaryInput.addEventListener('blur', function () {
  inputWrapper.classList.remove('focus');
});

// Mode buttons
mode8BitBtn.addEventListener('click', function () {
  switchMode('8bit');
});
modeVariableBtn.addEventListener('click', function () {
  switchMode('variable');
});

// Pad buttons
pad0Btn.addEventListener('click', function () {
  appendDigit('0');
});
pad1Btn.addEventListener('click', function () {
  appendDigit('1');
});
padBackBtn.addEventListener('click', backspaceDigit);
invertBtn.addEventListener('click', invertCurrentBits);

// Preset test chips click delegation (Strictly NO arrays)
presetChips.addEventListener('click', function (e) {
  const target = e.target;
  const chip = target.closest('.preset-chip');
  if (chip) {
    const testValue = chip.getAttribute('data-test');
    if (testValue !== null) {
      setBinaryValue(testValue);
      showToast('Loaded test case: ' + testValue);
    }
  }
});

// 8-bit board register click delegation (Strictly NO arrays)
bitBoard.addEventListener('click', function (e) {
  const target = e.target;
  const cell = target.closest('.bit-cell');
  if (cell) {
    const bitPosAttr = cell.getAttribute('data-bit-pos');
    if (bitPosAttr !== null) {
      const bitPos = Number(bitPosAttr);
      toggleBitAtPosition(bitPos);
    }
  }
});

// Action buttons
clearInputBtn.addEventListener('click', function () {
  binaryInput.value = '';
  processConversion();
  binaryInput.focus();
});
clearAllBtn.addEventListener('click', resetAllFields);
pasteBtn.addEventListener('click', pasteFromClipboard);
copyBtn.addEventListener('click', copyDecimalResult);
randomBtn.addEventListener('click', generateRandom8Bit);

// Prevent accidental form submissions or non-numeric keys if desired
binaryInput.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') {
    resetAllFields();
  }
});

// Initialize on page load
processConversion();
