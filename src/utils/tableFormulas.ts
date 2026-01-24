// Table formula utilities with security protections
// Supports: =SUM(values), =SUB(values), =MUL(values), =DIV(values)
// Values can be cell references like A1, B2 or direct numbers

// Security constants
const MAX_RECURSION_DEPTH = 50;
const MAX_FORMULA_LENGTH = 500;
const MAX_RANGE_SIZE = 1000; // Maximum cells in a range

export interface FormulaResult {
  value: string;
  isFormula: boolean;
  error?: string;
}

// Track visited cells to detect circular references
const createVisitedTracker = () => new Set<string>();

// Parse cell reference like "A1" to row and column indices
const parseCellRef = (ref: string): { row: number; col: number } | null => {
  // Validate input length
  if (!ref || ref.length > 10) return null;
  
  const match = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!match) return null;
  
  const colStr = match[1].toUpperCase();
  const rowNum = parseInt(match[2], 10);
  
  // Bounds check for row number
  if (rowNum <= 0 || rowNum > 10000) return null;
  
  const row = rowNum - 1; // Convert to 0-based
  
  // Convert column letters to index (A=0, B=1, ... Z=25, AA=26, etc.)
  // Limit to 3 letters (ZZZ = 18277 columns max)
  if (colStr.length > 3) return null;
  
  let col = 0;
  for (let i = 0; i < colStr.length; i++) {
    col = col * 26 + (colStr.charCodeAt(i) - 'A'.charCodeAt(0) + 1);
  }
  col -= 1; // Convert to 0-based
  
  return { row, col };
};

// Get cell key for tracking visited cells
const getCellKey = (row: number, col: number): string => `${row}:${col}`;

// Get value from cell reference with circular reference protection
const getCellValue = (
  ref: string, 
  rows: string[][], 
  visited: Set<string>,
  depth: number
): number | null => {
  const parsed = parseCellRef(ref);
  if (!parsed) return null;
  
  const { row, col } = parsed;
  
  // Bounds check
  if (row < 0 || row >= rows.length || col < 0 || col >= (rows[row]?.length || 0)) {
    return null;
  }
  
  const cellKey = getCellKey(row, col);
  
  // Circular reference check
  if (visited.has(cellKey)) {
    return null;
  }
  
  const cellValue = rows[row][col];
  
  // If the cell contains a formula, we need to evaluate it first
  const result = evaluateFormulaInternal(cellValue, rows, visited, depth + 1);
  if (result.error) return null;
  
  const numValue = parseFloat(result.value);
  return isNaN(numValue) ? null : numValue;
};

// Parse formula arguments (comma-separated values or cell references)
const parseFormulaArgs = (
  argsStr: string, 
  rows: string[][], 
  visited: Set<string>,
  depth: number
): number[] => {
  // Validate args string length
  if (argsStr.length > MAX_FORMULA_LENGTH) {
    return [];
  }
  
  const args = argsStr.split(',').map(arg => arg.trim());
  const values: number[] = [];
  
  for (const arg of args) {
    // Validate individual arg
    if (arg.length > 50) continue;
    
    // Check if it's a range like A1:A5
    if (arg.includes(':')) {
      const parts = arg.split(':');
      if (parts.length !== 2) continue;
      
      const [start, end] = parts.map(a => a.trim());
      const startRef = parseCellRef(start);
      const endRef = parseCellRef(end);
      
      if (startRef && endRef) {
        const minRow = Math.min(startRef.row, endRef.row);
        const maxRow = Math.max(startRef.row, endRef.row);
        const minCol = Math.min(startRef.col, endRef.col);
        const maxCol = Math.max(startRef.col, endRef.col);
        
        // Check range size to prevent DoS
        const rangeSize = (maxRow - minRow + 1) * (maxCol - minCol + 1);
        if (rangeSize > MAX_RANGE_SIZE) continue;
        
        for (let r = minRow; r <= maxRow; r++) {
          for (let c = minCol; c <= maxCol; c++) {
            if (r >= 0 && r < rows.length && c >= 0 && c < (rows[r]?.length || 0)) {
              const cellKey = getCellKey(r, c);
              
              // Skip if circular reference
              if (visited.has(cellKey)) continue;
              
              const cellValue = rows[r][c];
              const result = evaluateFormulaInternal(cellValue, rows, visited, depth + 1);
              if (!result.error) {
                const numValue = parseFloat(result.value);
                if (!isNaN(numValue)) {
                  values.push(numValue);
                }
              }
            }
          }
        }
      }
    } else if (parseCellRef(arg)) {
      // It's a cell reference
      const value = getCellValue(arg, rows, visited, depth);
      if (value !== null) {
        values.push(value);
      }
    } else {
      // It's a direct number - validate format
      const sanitizedArg = arg.replace(/[^\d.\-]/g, '');
      const numValue = parseFloat(sanitizedArg);
      if (!isNaN(numValue) && isFinite(numValue)) {
        values.push(numValue);
      }
    }
  }
  
  return values;
};

// Internal formula evaluation with depth tracking
const evaluateFormulaInternal = (
  input: string, 
  rows: string[][], 
  visited: Set<string>,
  depth: number
): FormulaResult => {
  // Depth check to prevent stack overflow
  if (depth > MAX_RECURSION_DEPTH) {
    return { value: '#ERR', isFormula: true, error: 'Max depth exceeded' };
  }
  
  // Input validation
  if (!input || typeof input !== 'string') {
    return { value: '', isFormula: false };
  }
  
  const trimmed = input.trim();
  
  // Length validation
  if (trimmed.length > MAX_FORMULA_LENGTH) {
    return { value: '#ERR', isFormula: true, error: 'Formula too long' };
  }
  
  // Check if it starts with =
  if (!trimmed.startsWith('=')) {
    return { value: input, isFormula: false };
  }
  
  const formulaStr = trimmed.substring(1).toUpperCase();
  
  // Match formula pattern: FUNCTION(args) - strict validation
  const match = formulaStr.match(/^(SUM|SUB|MUL|DIV|MULTIPLY|DIVIDE|ADD|SUBTRACT)\(([^()]*)\)$/);
  
  if (!match) {
    return { value: '#ERR', isFormula: true, error: 'Invalid formula syntax' };
  }
  
  const func = match[1];
  const argsStr = match[2];
  
  // Validate args don't contain nested parentheses (no nested formulas in args)
  if (argsStr.includes('(') || argsStr.includes(')')) {
    return { value: '#ERR', isFormula: true, error: 'Nested formulas not allowed' };
  }
  
  const values = parseFormulaArgs(argsStr, rows, visited, depth);
  
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
      return { value: '#ERR', isFormula: true, error: 'Unknown function' };
  }
  
  // Check for valid result
  if (!isFinite(result)) {
    return { value: '#ERR', isFormula: true, error: 'Invalid result' };
  }
  
  // Format result to 2 decimal places if needed
  const formatted = Number.isInteger(result) ? result.toString() : result.toFixed(2);
  
  return { value: formatted, isFormula: true };
};

// Public API - Evaluate a formula string
export const evaluateFormula = (input: string, rows: string[][]): FormulaResult => {
  const visited = createVisitedTracker();
  return evaluateFormulaInternal(input, rows, visited, 0);
};

// Get display value for a cell (evaluates formula if present)
export const getDisplayValue = (cellValue: string, rows: string[][]): string => {
  const result = evaluateFormula(cellValue, rows);
  if (result.error) {
    return '#ERR';
  }
  return result.value;
};