import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Minus, Trash2, Calculator, Type } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getDisplayValue } from "@/utils/tableFormulas";

export interface TableData {
  header?: string;
  rows: string[][];
}

interface TableSectionProps {
  data: TableData;
  onChange: (data: TableData) => void;
}

const TableSection = ({ data, onChange }: TableSectionProps) => {
  const addRow = () => {
    const colCount = data.rows[0]?.length || 3;
    const newRow = Array(colCount).fill("");
    onChange({ ...data, rows: [...data.rows, newRow] });
  };

  const removeRow = (rowIndex: number) => {
    if (data.rows.length <= 1) return;
    onChange({ ...data, rows: data.rows.filter((_, i) => i !== rowIndex) });
  };

  const addColumn = () => {
    const newRows = data.rows.map((row) => [...row, ""]);
    onChange({ ...data, rows: newRows });
  };

  const removeColumn = (colIndex: number) => {
    if (data.rows[0]?.length <= 1) return;
    const newRows = data.rows.map((row) => row.filter((_, i) => i !== colIndex));
    onChange({ ...data, rows: newRows });
  };

  const updateCell = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = data.rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : row
    );
    onChange({ ...data, rows: newRows });
  };

  const updateHeader = (value: string) => {
    onChange({ ...data, header: value });
  };

  const toggleHeader = () => {
    if (data.header !== undefined) {
      const { header, ...rest } = data;
      onChange({ ...rest, rows: data.rows });
    } else {
      onChange({ ...data, header: "" });
    }
  };

  const initializeTable = () => {
    onChange({
      rows: [
        ["", "", ""],
        ["", "", ""],
        ["", "", ""],
      ],
    });
  };

  const isFormula = (value: string) => value.trim().startsWith('=');

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-card-foreground">Section 2: Table Only</h2>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Calculator className="h-4 w-4 text-muted-foreground" />
                </Button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover">
                <p className="font-semibold mb-1">Formula Support:</p>
                <ul className="text-xs space-y-1">
                  <li>=SUM(A1,A2,A3) or =SUM(A1:A3)</li>
                  <li>=SUB(A1,A2) - Subtract</li>
                  <li>=MUL(A1,A2) - Multiply</li>
                  <li>=DIV(A1,A2) - Divide</li>
                </ul>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={data.header !== undefined ? "default" : "outline"} 
            size="sm" 
            onClick={toggleHeader} 
            className="flex items-center gap-1"
          >
            <Type className="h-4 w-4" />
            Header
          </Button>
          <Button variant="outline" size="sm" onClick={addRow} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Row
          </Button>
          <Button variant="outline" size="sm" onClick={addColumn} className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            Column
          </Button>
        </div>
      </div>

      <div className="min-h-[100px] border border-input bg-background p-4 overflow-x-auto">
        {data.header !== undefined && (
          <input
            type="text"
            value={data.header}
            onChange={(e) => updateHeader(e.target.value)}
            placeholder="Enter table header..."
            className="w-full text-xl font-bold bg-transparent border-b border-input focus:border-primary focus:outline-none py-2 mb-4 text-foreground placeholder:text-muted-foreground"
          />
        )}
        
        {data.rows.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No table created yet.</p>
            <Button onClick={initializeTable} variant="outline">
              Create Table
            </Button>
          </div>
        ) : (
          <table className="w-full border-collapse">
            <tbody>
              {data.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="group">
                  {row.map((cell, colIndex) => {
                    const displayValue = getDisplayValue(cell, data.rows);
                    const hasFormula = isFormula(cell);
                    return (
                      <td key={colIndex} className="border border-input p-0 relative">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                className={`w-full p-2 bg-transparent focus:outline-none focus:bg-accent/50 text-foreground ${hasFormula ? 'text-primary font-medium' : ''}`}
                                placeholder="..."
                              />
                            </TooltipTrigger>
                            {hasFormula && (
                              <TooltipContent className="bg-popover">
                                <p>Result: {displayValue}</p>
                              </TooltipContent>
                            )}
                          </Tooltip>
                        </TooltipProvider>
                        {rowIndex === 0 && (
                          <button
                            onClick={() => removeColumn(colIndex)}
                            className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80 bg-card p-1"
                            title="Remove column"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                        )}
                      </td>
                    );
                  })}
                  <td className="border-none p-1 w-8">
                    <button
                      onClick={() => removeRow(rowIndex)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </Card>
  );
};

export default TableSection;
