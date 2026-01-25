import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDisplayValue } from "@/utils/tableFormulas";

export interface FormattedText {
  content: string;
  fontSize: number;
  isBold: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
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
      text: { content: "", fontSize: 11, isBold: false, isItalic: false, isUnderline: false, alignment: 'left' }
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

  const renderTextItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.text) return null;
    const text = item.text;
    
    return (
      <div className="flex flex-col gap-3 group bg-card border border-border rounded-lg p-4 shadow-sm">
        {/* Word-like Toolbar */}
        <div className="flex items-center gap-1 flex-wrap border-b border-border pb-3 mb-2">
          {/* Font Size */}
          <Select
            value={text.fontSize.toString()}
            onValueChange={(val) => updateItem(sectionIndex, item.id, { 
              text: { ...text, fontSize: parseInt(val) } 
            })}
          >
            <SelectTrigger className="w-20 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map(size => (
                <SelectItem key={size} value={size.toString()}>{size}px</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Bold */}
          <Button
            variant={text.isBold ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, isBold: !text.isBold } 
            })}
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-4 w-4" />
          </Button>
          
          {/* Italic */}
          <Button
            variant={text.isItalic ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, isItalic: !text.isItalic } 
            })}
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-4 w-4" />
          </Button>
          
          {/* Underline */}
          <Button
            variant={text.isUnderline ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, isUnderline: !text.isUnderline } 
            })}
            title="Underline (Ctrl+U)"
          >
            <Underline className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          {/* Text Alignment */}
          <Button
            variant={text.alignment === 'left' ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, alignment: 'left' } 
            })}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </Button>
          
          <Button
            variant={text.alignment === 'center' ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, alignment: 'center' } 
            })}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </Button>
          
          <Button
            variant={text.alignment === 'right' ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, alignment: 'right' } 
            })}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant={text.alignment === 'justify' ? "default" : "outline"}
            size="icon"
            className="h-9 w-9"
            onClick={() => updateItem(sectionIndex, item.id, { 
              text: { ...text, alignment: 'justify' } 
            })}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </Button>
          
          <div className="flex-1" />
          
          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(sectionIndex, item.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Text Area - Large and easy to use */}
        <textarea
          value={text.content}
          onChange={(e) => updateItem(sectionIndex, item.id, { 
            text: { ...text, content: e.target.value } 
          })}
          placeholder="Start typing here... (Like Microsoft Word)"
          className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none p-4 text-foreground placeholder:text-muted-foreground rounded-md resize-none"
          style={{ 
            fontSize: `${text.fontSize}px`,
            fontWeight: text.isBold ? 'bold' : 'normal',
            fontStyle: text.isItalic ? 'italic' : 'normal',
            textDecoration: text.isUnderline ? 'underline' : 'none',
            textAlign: text.alignment || 'left',
            minHeight: '150px',
            lineHeight: '1.6',
          }}
        />
      </div>
    );
  };

  const renderTableItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.tableData) return null;
    const rows = item.tableData.rows;
    const isFormula = (value: string) => value.trim().startsWith('=');
    
    return (
      <div className="group bg-card border border-border rounded-lg p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-4 border-b border-border pb-3">
          <input
            type="text"
            value={item.tableData.header || ""}
            onChange={(e) => updateItem(sectionIndex, item.id, { 
              tableData: { ...item.tableData!, header: e.target.value } 
            })}
            placeholder="Table Title (optional)..."
            className="flex-1 bg-transparent border-b-2 border-input focus:border-primary focus:outline-none py-2 text-foreground placeholder:text-muted-foreground font-semibold text-lg"
          />
          
          <Button variant="outline" size="sm" onClick={() => addTableRow(sectionIndex, item.id)}>
            <Plus className="h-4 w-4 mr-1" /> Row
          </Button>
          <Button variant="outline" size="sm" onClick={() => addTableColumn(sectionIndex, item.id)}>
            <Plus className="h-4 w-4 mr-1" /> Column
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={() => removeItem(sectionIndex, item.id)}
            className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Formula Help */}
        <div className="mb-3 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
          <strong>Formulas:</strong> Use Excel-like syntax: <code className="bg-muted px-1 rounded">=SUM(A2:A5)</code>, <code className="bg-muted px-1 rounded">=SUB(B2,B3)</code>, <code className="bg-muted px-1 rounded">=MUL(C2:C4)</code>, <code className="bg-muted px-1 rounded">=DIV(D2,D3)</code>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="group/row">
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
                        <input
                          type="text"
                          value={cell}
                          onChange={(e) => updateTableCell(sectionIndex, item.id, ri, ci, e.target.value)}
                          className={cn(
                            "w-full p-3 bg-transparent focus:outline-none focus:bg-accent/50 min-w-[100px]",
                            ri === 0 ? "text-white font-semibold text-center" : "text-foreground",
                            hasFormula && "text-primary font-medium"
                          )}
                          placeholder={ri === 0 ? "Header" : "..."}
                          title={hasFormula ? `Formula: ${cell} = ${displayValue}` : undefined}
                        />
                        {hasFormula && (
                          <span className="absolute bottom-1 right-1 text-[10px] text-primary opacity-70">
                            ={displayValue}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  
                  {/* Remove row button */}
                  <td className="border-none p-1 w-8">
                    <button
                      onClick={() => removeTableRow(sectionIndex, item.id, ri)}
                      className="opacity-0 group-hover/row:opacity-100 transition-opacity text-destructive hover:text-destructive/80 p-1"
                      title="Remove row"
                    >
                      <Trash2 className="h-4 w-4" />
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

  const section = sections[activeSection];

  return (
    <div className="h-full flex flex-col">
      {/* Section Tabs */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-t-lg border border-border border-b-0">
        {sections.map((sec, index) => (
          <Button
            key={sec.id}
            variant={activeSection === index ? "default" : "ghost"}
            size="sm"
            onClick={() => onActiveSectionChange(index)}
            className={cn(
              "transition-all duration-200 font-medium",
              activeSection === index && "shadow-md"
            )}
            style={activeSection === index ? { backgroundColor: themeColor } : {}}
          >
            {index + 1}. {sec.title.length > 15 ? sec.title.slice(0, 15) + '...' : sec.title}
          </Button>
        ))}
      </div>

      {/* Active Section Content - Full height, no scroll box */}
      <Card className="flex-1 rounded-t-none border-t-0 overflow-visible">
        <div className="p-6">
          {/* Section Title */}
          <h2 
            className="text-xl font-bold mb-6 pb-3 border-b-2"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Section {activeSection + 1}: {section?.title || "Untitled"}
          </h2>
          
          {/* Add Item Buttons */}
          <div className="flex gap-3 mb-6">
            <Button
              variant="outline"
              onClick={() => addTextItem(activeSection)}
              className="flex-1 h-12 text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Text Block
            </Button>
            <Button
              variant="outline"
              onClick={() => addTableItem(activeSection)}
              className="flex-1 h-12 text-base"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Table
            </Button>
          </div>
          
          {/* Section Items - Natural flow, no fixed height */}
          <div className="space-y-6">
            {section?.items.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground border-2 border-dashed border-border rounded-lg">
                <p className="text-lg mb-2">This section is empty</p>
                <p className="text-sm">Click "Add Text Block" or "Add Table" to start adding content</p>
              </div>
            ) : (
              section?.items.map(item => (
                <div key={item.id}>
                  {item.type === "text" && renderTextItem(activeSection, item)}
                  {item.type === "table" && renderTableItem(activeSection, item)}
                </div>
              ))
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SectionEditor;
