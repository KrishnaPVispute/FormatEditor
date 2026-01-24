// Table formula utilities
// Supports: =SUM(values), =SUB(values), =MUL(values), =DIV(values)
// Values can be cell references like A1, B2 or direct numbers

export interface FormulaResult {
  value: string;
  isFormula: boolean;
  error?: string;
}

// Parse cell reference like "A1" to row and column indices
const parseCellRef = (ref: string): { row: number; col: number } | null => {
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  
  const colStr = match[1].toUpperCase();
  const row = parseInt(match[2], 10) - 1; // Convert to 0-based
  
  // Convert column letters to index (A=0, B=1, ... Z=25, AA=26, etc.)
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  col -= 1; // Convert to 0-based
  
  return { row, col };
};

// Get value from cell reference
const getCellValue = (ref: string, rows: string[][]): number | null => {
  const parsed = parseCellRef(ref);
  if (!parsed) return null;
  
  const { row, col } = parsed;
  if (row < 0 || row >= rows.length || col < 0 || col >= (rows[row]?.length || 0)) {
    return null;
  }
  
  const cellValue = rows[row][col];
  // If the cell contains a formula, we need to evaluate it first
  const result = evaluateFormula(cellValue, rows);
  const numValue = parseFloat(result.value);
  return isNaN(numValue) ? null : numValue;
};

// Parse formula arguments (comma-separated values or cell references)
const parseFormulaArgs = (argsStr: string, rows: string[][]): number[] => {
  const args = argsStr.split(',').map(arg => arg.trim());
  const values: number[] = [];
  
  for (const arg of args) {
    // Check if it's a range like A1:A5
    if (arg.includes(':')) {
      const [start, end] = arg.split(':').map(a => a.trim());
      const startRef = parseCellRef(start);
      const endRef = parseCellRef(end);
      
      if (startRef && endRef) {
        const minRow = Math.min(startRef.row, endRef.row);
        const maxRow = Math.max(startRef.row, endRef.row);
        const minCol = Math.min(startRef.col, endRef.col);
        const maxCol = Math.max(startRef.col, endRef.col);
        
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            if (r >= 0 && r < rows.length && c >= 0 && c < (rows[r]?.length || 0)) {
              const cellValue = rows[r][c];
              const result = evaluateFormula(cellValue, rows);
              const numValue = parseFloat(result.value);
              if (!isNaN(numValue)) {
                values.push(numValue);
              }
            }
          }
        }
      }
    } else if (parseCellRef(arg)) {
      // It's a cell reference
      const value = getCellValue(arg, rows);
      if (value !== null) {
        values.push(value);
      }
    } else {
      // It's a direct number
      const numValue = parseFloat(arg);
      if (!isNaN(numValue)) {
        values.push(numValue);
      }
    }
  }
  
  return values;
};

// Evaluate a formula string
export const evaluateFormula = (input: string, rows: string[][]): FormulaResult => {
  const trimmed = input.trim();
  
  // Check if it starts with =
  if (!trimmed.startsWith('=')) {
    return { value: input, isFormula: false };
  }
  
  const formulaStr = trimmed.substring(1).toUpperCase();
  
  // Match formula pattern: FUNCTION(args)
  const match = formulaStr.match(/^(SUM|SUB|MUL|DIV|MULTIPLY|DIVIDE|ADD|SUBTRACT)\((.+)\)$/);
  
  if (!match) {
    return { value: input, isFormula: true, error: 'Invalid formula' };
  }
  
  const func = match[1];
  const argsStr = match[2];
  const values = parseFormulaArgs(argsStr, rows);
  
  if (values.length === 0) {
    return { value: '0', isFormula: true };
  }
  
  let result: number;
  
  switch (func) {
    case 'SUM':
    case 'ADD':
      result = values.reduce((acc, val) => acc + val, 0);
      break;
    case 'SUB':
    case 'SUBTRACT':
      result = values.reduce((acc, val, idx) => idx === 0 ? val : acc - val);
      break;
    case 'MUL':
    case 'MULTIPLY':
      result = values.reduce((acc, val) => acc * val, 1);
      break;
    case 'DIV':
    case 'DIVIDE':
      if (values.length < 2) {
        return { value: values[0]?.toString() || '0', isFormula: true };
      }
      result = values.reduce((acc, val, idx) => {
        if (idx === 0) return val;
        if (val === 0) return acc; // Avoid division by zero
        return acc / val;
      });
      break;
    default:
      return { value: input, isFormula: true, error: 'Unknown function' };
  }
  
  // Format result to 2 decimal places if needed
  const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(2);
  
  return { value: formatted, isFormula: true };
};

// Get display value for a cell (evaluates formula if present)
export const getDisplayValue = (cellValue: string, rows: string[][]): string => {
  const result = evaluateFormula(cellValue, rows);
  if (result.error) {
    return `#ERR: ${result.error}`;
  }
  return result.value;
};
