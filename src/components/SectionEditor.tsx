import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, Plus, Trash2, Bold, Sigma } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDisplayValue } from "@/utils/tableFormulas";

export interface FormattedText {
  content: string;
  fontSize: number;
  isBold: boolean;
}

export interface SectionItem {
  id: string;
  type: "text" | "table";
  text?: FormattedText;
  tableData?: {
    rows: string[][];
    header?: string;
  };
}

export interface Section {
  id: string;
  title: string;
  items: SectionItem[];
}

interface SectionEditorProps {
  sections: Section[];
  onChange: (sections: Section[]) => void;
  activeSection: number;
  onActiveSectionChange: (index: number) => void;
  templateType?: "LCA" | "LCP";
}

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

const SectionEditor = ({ 
  sections, 
  onChange, 
  activeSection, 
  onActiveSectionChange,
  templateType = "LCP"
}: SectionEditorProps) => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const themeColor = templateType === "LCA" ? "#CC7900" : "#2E74B5";

  const updateSection = (index: number, updatedSection: Section) => {
    const newSections = [...sections];
    newSections[index] = updatedSection;
    onChange(newSections);
  };

  const addTextItem = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const newItem: SectionItem = {
      id: crypto.randomUUID(),
      type: "text",
      text: { content: "", fontSize: 11, isBold: false }
    };
    updateSection(sectionIndex, { ...section, items: [...section.items, newItem] });
  };

  const addTableItem = (sectionIndex: number) => {
    const section = sections[sectionIndex];
    const newItem: SectionItem = {
      id: crypto.randomUUID(),
      type: "table",
      tableData: {
        rows: [["", "", ""], ["", "", ""], ["", "", ""]],
        header: ""
      }
    };
    updateSection(sectionIndex, { ...section, items: [...section.items, newItem] });
  };

  const updateItem = (sectionIndex: number, itemId: string, updates: Partial<SectionItem>) => {
    const section = sections[sectionIndex];
    const newItems = section.items.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    );
    updateSection(sectionIndex, { ...section, items: newItems });
  };

  const removeItem = (sectionIndex: number, itemId: string) => {
    const section = sections[sectionIndex];
    updateSection(sectionIndex, { 
      ...section, 
      items: section.items.filter(item => item.id !== itemId) 
    });
  };

  const updateTableCell = (sectionIndex: number, itemId: string, rowIndex: number, colIndex: number, value: string) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData) {
      const newRows = item.tableData.rows.map((row, ri) =>
        ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
      );
      updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
    }
  };

  const addTableRow = (sectionIndex: number, itemId: string) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData) {
      const colCount = item.tableData.rows[0]?.length || 3;
      const newRow = Array(colCount).fill("");
      updateItem(sectionIndex, itemId, { 
        tableData: { ...item.tableData, rows: [...item.tableData.rows, newRow] } 
      });
    }
  };

  const addTableColumn = (sectionIndex: number, itemId: string) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData) {
      const newRows = item.tableData.rows.map(row => [...row, ""]);
      updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
    }
  };

  const removeTableRow = (sectionIndex: number, itemId: string, rowIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData && item.tableData.rows.length > 1) {
      const newRows = item.tableData.rows.filter((_, i) => i !== rowIndex);
      updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
    }
  };

  const removeTableColumn = (sectionIndex: number, itemId: string, colIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData && item.tableData.rows[0]?.length > 1) {
      const newRows = item.tableData.rows.map(row => row.filter((_, i) => i !== colIndex));
      updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
    }
  };

  // Calculate column sum
  const calculateColumnSum = (rows: string[][], colIndex: number): number => {
    return rows.slice(1).reduce((sum, row) => {
      const val = row[colIndex]?.replace(/[$,]/g, '') || '0';
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  // Calculate row sum
  const calculateRowSum = (row: string[]): number => {
    return row.slice(1).reduce((sum, cell) => {
      const val = cell?.replace(/[$,]/g, '') || '0';
      const num = parseFloat(val);
      return sum + (isNaN(num) ? 0 : num);
    }, 0);
  };

  // Add total row for a column
  const addColumnTotal = (sectionIndex: number, itemId: string, colIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData) {
      const sum = calculateColumnSum(item.tableData.rows, colIndex);
      const lastRow = item.tableData.rows[item.tableData.rows.length - 1];
      const isAlreadyTotalRow = lastRow[0]?.toLowerCase().includes('total');
      
      if (isAlreadyTotalRow) {
        // Update existing total row
        const newRows = item.tableData.rows.map((row, ri) => {
          if (ri === item.tableData!.rows.length - 1) {
            return row.map((cell, ci) => ci === colIndex ? sum.toFixed(2) : cell);
          }
          return row;
        });
        updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
      } else {
        // Add new total row
        const newRow = Array(lastRow.length).fill("");
        newRow[0] = "Total";
        newRow[colIndex] = sum.toFixed(2);
        updateItem(sectionIndex, itemId, { 
          tableData: { ...item.tableData, rows: [...item.tableData.rows, newRow] } 
        });
      }
    }
  };

  // Add total column for a row
  const addRowTotal = (sectionIndex: number, itemId: string, rowIndex: number) => {
    const section = sections[sectionIndex];
    const item = section.items.find(i => i.id === itemId);
    if (item?.tableData) {
      const row = item.tableData.rows[rowIndex];
      const sum = calculateRowSum(row);
      const lastColIndex = row.length - 1;
      const hasRowTotalCol = item.tableData.rows[0]?.[lastColIndex]?.toLowerCase().includes('total');
      
      if (hasRowTotalCol) {
        // Update existing total column
        const newRows = item.tableData.rows.map((r, ri) => {
          if (ri === rowIndex) {
            return [...r.slice(0, lastColIndex), sum.toFixed(2)];
          }
          return r;
        });
        updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
      } else {
        // Add new total column
        const newRows = item.tableData.rows.map((r, ri) => {
          if (ri === 0) return [...r, "Total"];
          if (ri === rowIndex) return [...r, sum.toFixed(2)];
          return [...r, ""];
        });
        updateItem(sectionIndex, itemId, { tableData: { ...item.tableData, rows: newRows } });
      }
    }
  };

  const renderTextItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.text) return null;
    
    return (
      <div className="flex flex-col gap-2 group bg-muted/30 p-3 rounded-md">
        <div className="flex items-center gap-2 mb-1">
          <Select
            value={item.text.fontSize.toString()}
            onValueChange={(val) => updateItem(sectionIndex, item.id, { 
              text: { ...item.text!, fontSize: parseInt(val) } 
            })}
          >
            <SelectTrigger className="w-20 h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map(size => (
                <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            variant={item.text.isBold ? "default" : "outline"}
            size="icon"
            className="h-8 w-8"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...item.text!, isBold: !item.text!.isBold } 
            })}
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(sectionIndex, item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <textarea
          value={item.text.content}
          onChange={(e) => updateItem(sectionIndex, item.id, { 
            text: { ...item.text!, content: e.target.value } 
          })}
          placeholder="Enter text content..."
          className="w-full bg-background border border-input focus:border-primary focus:outline-none p-3 text-foreground placeholder:text-muted-foreground resize-none"
          style={{ 
            fontSize: `${item.text.fontSize}px`,
            fontWeight: item.text.isBold ? 'bold' : 'normal',
            minHeight: '60px',
            height: 'auto'
          }}
          rows={Math.max(3, (item.text.content.split('\n').length || 1))}
        />
      </div>
    );
  };

  const renderTableItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.tableData) return null;
    const rows = item.tableData.rows;
    const isFormula = (value: string) => value.trim().startsWith('=');
    
    return (
      <div className="group bg-muted/30 p-3 rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="text"
            value={item.tableData.header || ""}
            onChange={(e) => updateItem(sectionIndex, item.id, { 
              tableData: { ...item.tableData!, header: e.target.value } 
            })}
            placeholder="Table header (optional)..."
            className="flex-1 bg-transparent border-b border-input focus:border-primary focus:outline-none py-1 text-foreground placeholder:text-muted-foreground font-semibold"
          />
          
          <Button variant="outline" size="sm" onClick={() => addTableRow(sectionIndex, item.id)}>
            <Plus className="h-3 w-3 mr-1" /> Row
          </Button>
          <Button variant="outline" size="sm" onClick={() => addTableColumn(sectionIndex, item.id)}>
            <Plus className="h-3 w-3 mr-1" /> Col
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(sectionIndex, item.id)}
            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive h-8 w-8"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="group/row">
                  {/* Row Σ button for first column */}
                  {ri > 0 && (
                    <td className="border-none p-0 w-6">
                      <button
                        onClick={() => addRowTotal(sectionIndex, item.id, ri)}
                        className="opacity-0 group-hover/row:opacity-100 transition-opacity p-1 hover:text-primary"
                        title="Calculate row total"
                      >
                        <Sigma className="h-3 w-3" />
                      </button>
                    </td>
                  )}
                  {ri === 0 && <td className="border-none p-0 w-6" />}
                  
                  {row.map((cell, ci) => {
                    const displayValue = getDisplayValue(cell, rows);
                    const hasFormula = isFormula(cell);
                    
                    return (
                      <td 
                        key={ci} 
                        className="border border-input p-0 relative"
                        style={{ 
                          backgroundColor: ri === 0 ? themeColor : 'transparent',
                        }}
                      >
                        {/* Column Σ button for header row */}
                        {ri === 0 && (
                          <button
                            onClick={() => addColumnTotal(sectionIndex, item.id, ci)}
                            className="absolute -top-5 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-primary bg-card rounded"
                            title="Calculate column total"
                          >
                            <Sigma className="h-3 w-3" />
                          </button>
                        )}
                        <input
                          type="text"
                          value={hasFormula ? displayValue : cell}
                          onChange={(e) => updateTableCell(sectionIndex, item.id, ri, ci, e.target.value)}
                          onFocus={(e) => {
                            if (hasFormula) e.target.value = cell;
                          }}
                          onBlur={(e) => {
                            if (isFormula(e.target.value)) {
                              e.target.value = getDisplayValue(e.target.value, rows);
                            }
                          }}
                          className={cn(
                            "w-full p-2 bg-transparent focus:outline-none focus:bg-accent/50",
                            ri === 0 ? "text-white font-semibold text-center" : "text-foreground",
                            hasFormula && "text-primary font-medium"
                          )}
                          placeholder="..."
                        />
                      </td>
                    );
                  })}
                  
                  {/* Remove row button */}
                  <td className="border-none p-1 w-6">
                    <button
                      onClick={() => removeTableRow(sectionIndex, item.id, ri)}
                      className="opacity-0 group-hover/row:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
                      title="Remove row"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-2">
      {/* Section Selector Bar */}
      <div className="flex flex-wrap gap-2 p-2 bg-muted rounded-lg sticky top-16 z-10">
        {sections.map((section, index) => (
          <Button
            key={section.id}
            variant={activeSection === index ? "default" : "outline"}
            size="sm"
            onClick={() => onActiveSectionChange(index)}
            className="transition-all duration-200"
            style={activeSection === index ? { backgroundColor: themeColor } : {}}
          >
            Section {index + 1}
          </Button>
        ))}
      </div>

      {/* Section Content */}
      {sections.map((section, index) => (
        <Collapsible 
          key={section.id} 
          open={activeSection === index}
          onOpenChange={(open) => open && onActiveSectionChange(index)}
        >
          <Card 
            className={cn(
              "transition-all duration-300 ease-in-out overflow-hidden",
              activeSection === index ? "border-primary shadow-md" : "border-border"
            )}
            ref={el => sectionRefs.current[index] = el}
          >
            <CollapsibleTrigger asChild>
              <div 
                className={cn(
                  "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                  activeSection === index && "bg-muted/30"
                )}
                style={activeSection === index ? { borderLeft: `4px solid ${themeColor}` } : {}}
              >
                <h3 className="font-semibold text-card-foreground">
                  Section {index + 1}: {section.title || `Content Block ${index + 1}`}
                </h3>
                <ChevronDown 
                  className={cn(
                    "h-5 w-5 transition-transform duration-200",
                    activeSection === index && "rotate-180"
                  )} 
                />
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent className="animate-accordion-down data-[state=closed]:animate-accordion-up">
              <div className="p-4 pt-0 space-y-4">
                {/* Add Item Buttons */}
                <div className="flex gap-2 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTextItem(index)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Text
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTableItem(index)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Table
                  </Button>
                </div>
                
                {/* Section Items */}
                <div className="space-y-4">
                  {section.items.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Add text or tables using the buttons above.
                    </p>
                  ) : (
                    section.items.map(item => (
                      <div key={item.id}>
                        {item.type === "text" && renderTextItem(index, item)}
                        {item.type === "table" && renderTableItem(index, item)}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}
    </div>
  );
};

export default SectionEditor;
