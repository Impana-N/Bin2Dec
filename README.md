# Bin2Dec - Binary to Decimal Converter

A responsive web application that converts binary numbers (base 2) into decimal numbers (base 10) in real time with an interactive mathematical step-by-step breakdown.

Built with **HTML5**, **CSS3**, and **vanilla JavaScript** without any external dependencies or frameworks.

---

## 🚀 Features

- **Real-Time Instant Conversion**: Converts valid binary input into its decimal equivalent automatically as the user types.
- **Strict Input Validation**:
  - Accepts only binary digits (`0` and `1`).
  - Alerts users immediately if any invalid character is typed (e.g., `'2'`), indicating the character and exact position.
- **8-Bit Restriction & Variable-Length Modes**:
  - **8-Bit Mode (Default)**: Restricts input to a maximum of 8 binary digits (1 byte, values 0–255).
  - **Variable Length Mode**: Allows arbitrary length binary inputs (powered by `BigInt` for arbitrary precision).
- **Interactive 8-Bit Visual Register**:
  - Clickable register switches representing bits $2^7$ (128) down to $2^0$ (1).
  - Synchronizes bi-directionally with the input field.
- **Mathematical Step-by-Step Breakdown**:
  - Displays the mathematical powers-of-2 positional formula:
    $$\text{Decimal} = \sum_{i=0}^{n-1} (\text{Digit}_i \times 2^{n - 1 - i})$$
  - Visualizes active vs. zero terms and evaluates the positional sum.
- **Quick Bit Keypad**:
  - On-screen `0`, `1`, `⌫` (Backspace), and `~` (Invert/NOT bits) buttons for mobile and touch devices.
- **Quick Test Cases**:
  - One-click sample chips to quickly test standard values and validation.
- **One-Click Clipboard Copy**:
  - Copy decimal results with toast notification feedback.
- **Secondary Representations**:
  - Displays Hexadecimal (`0x...`) and Octal (`0o...`) equivalents alongside active bit count.

---

## 🧮 Mathematical Conversion Logic

Under project constraints, this implementation strictly complies with:
1. **NO Arrays**: No array variables (`[]`), no `Array.from()`, no `.split()`, no `.map()`, and no `.reduce()`.
2. **NO Built-in `parseInt(binary, 2)`**: Conversion is computed manually using a mathematical loop over powers of 2.

### Conversion Steps:
For a binary string $S$ of length $L$:
1. Loop from index $i = 0$ to $L - 1$.
2. For each character $c = S.\text{charAt}(i)$:
   - Check if $c \in \{'0', '1'\}$. If not, trigger a validation error.
   - Calculate power $p = L - 1 - i$.
   - Compute positional value: $\text{digit} \times 2^p$.
   - Accumulate into the running decimal sum.
3. Output the final sum to the read-only output field.

---

## 🧪 Test Cases

| Binary Input | Expected Decimal | Result | Description |
| :--- | :--- | :--- | :--- |
| `0` | `0` | `0` | Single zero bit ($0 \times 2^0$) |
| `1` | `1` | `1` | Single one bit ($1 \times 2^0$) |
| `10` | `2` | `2` | Two bits ($1 \times 2^1 + 0 \times 2^0$) |
| `101` | `5` | `5` | Three bits ($4 + 0 + 1$) |
| `1011` | `11` | `11` | Four bits ($8 + 0 + 2 + 1$) |
| `101101` | `45` | `45` | Six bits ($32 + 0 + 8 + 4 + 0 + 1$) |
| `11111111` | `255` | `255` | Maximum 8-bit unsigned byte ($128+64+32+16+8+4+2+1$) |
| `1021` | Error | Validation Error | Detects `'2'` at position 3; prompts user |

---

## 📁 Project Structure

```text
├── index.html        # Semantic HTML5 markup
├── style.css         # Modern responsive CSS3 styling
├── script.js         # Vanilla JavaScript (Mathematical logic & DOM handlers)
└── README.md         # Documentation & test cases
```

---

## 💻 Getting Started

To run the application locally:
1. Clone or download the repository files.
2. Open `index.html` in any modern web browser.
   * No build step or local server required!

---

## 📜 License

MIT License. Free to use and modify for learning and educational purposes.
