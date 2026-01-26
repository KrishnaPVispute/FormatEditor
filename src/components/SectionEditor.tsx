import { useState, useRef, useEffect, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Pencil } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getDisplayValue } from "@/utils/tableFormulas";
import { Input } from "@/components/ui/input";
import RichTextEditor from "./RichTextEditor";

export interface FormattedText {
  content: string; // Now stores HTML content for rich text
  fontSize: number;
  isBold: boolean; // Legacy - kept for compatibility but not used for new rich text
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

// FONT_SIZES moved to RichTextEditor component

const SectionEditor = ({ 
  sections, 
  onChange, 
  activeSection, 
  onActiveSectionChange,
  templateType = "LCP"
}: SectionEditorProps) => {
  const themeColor = templateType === "LCA" ? "#CC7900" : "#2E74B5";
  const [editingTitleIndex, setEditingTitleIndex] = useState<number | null>(null);
  const [editingTitleValue, setEditingTitleValue] = useState("");
  
  // Track which cells are in "edit mode" (showing formula) vs "display mode" (showing result)
  const [editingCells, setEditingCells] = useState<Record<string, boolean>>({});

  // Auto-resize textarea helper
  const autoResizeTextarea = useCallback((textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.max(150, textarea.scrollHeight)}px`;
  }, []);

  // Start editing section title
  const startEditingTitle = (index: number) => {
    setEditingTitleIndex(index);
    setEditingTitleValue(sections[index].title);
  };

  // Save section title
  const saveTitle = () => {
    if (editingTitleIndex !== null && editingTitleValue.trim()) {
      const newSections = [...sections];
      newSections[editingTitleIndex] = { ...newSections[editingTitleIndex], title: editingTitleValue.trim() };
      onChange(newSections);
    }
    setEditingTitleIndex(null);
    setEditingTitleValue("");
  };

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

  // Apply formatting to selected text using execCommand (used by RichTextEditor callback)
  const applyFormatting = (command: string) => {
    document.execCommand(command, false);
  };

  const renderTextItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.text) return null;
    
    return (
      <RichTextEditor
        key={item.id}
        text={item.text}
        onTextChange={(newText) => updateItem(sectionIndex, item.id, { text: newText })}
        onDelete={() => removeItem(sectionIndex, item.id)}
      />
    );
  };

  const renderTableItem = (sectionIndex: number, item: SectionItem) => {
    if (!item.tableData) return null;
    const rows = item.tableData.rows;
    const isFormula = (value: string) => value.trim().startsWith('=');
    
    // Get cell key for tracking edit state
    const getCellKey = (itemId: string, ri: number, ci: number) => `${itemId}-${ri}-${ci}`;
    
    const handleCellKeyDown = (
      e: React.KeyboardEvent<HTMLInputElement>, 
      itemId: string, 
      ri: number, 
      ci: number, 
      cellValue: string
    ) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const cellKey = getCellKey(itemId, ri, ci);
        // If it's a formula, switch to display mode
        if (isFormula(cellValue)) {
          setEditingCells(prev => ({ ...prev, [cellKey]: false }));
        }
        // Move to next cell or blur
        (e.target as HTMLInputElement).blur();
      }
    };
    
    const handleCellFocus = (itemId: string, ri: number, ci: number) => {
      const cellKey = getCellKey(itemId, ri, ci);
      setEditingCells(prev => ({ ...prev, [cellKey]: true }));
    };
    
    const handleCellBlur = (itemId: string, ri: number, ci: number) => {
      const cellKey = getCellKey(itemId, ri, ci);
      setEditingCells(prev => ({ ...prev, [cellKey]: false }));
    };
    
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
          <strong>Formulas:</strong> Type formula → press <kbd className="bg-muted px-1 rounded border">Enter</kbd> to calculate. Examples: <code className="bg-muted px-1 rounded">=SUM(A2:A5)</code>, <code className="bg-muted px-1 rounded">=SUB(B2,B3)</code>, <code className="bg-muted px-1 rounded">=MUL(C2:C4)</code>, <code className="bg-muted px-1 rounded">=DIV(D2,D3)</code>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className="group/row">
                  {row.map((cell, ci) => {
                    const displayValue = getDisplayValue(cell, rows);
                    const hasFormula = isFormula(cell);
                    const cellKey = getCellKey(item.id, ri, ci);
                    const isEditing = editingCells[cellKey];
                    
                    // Show formula when editing, show result when not editing
                    const showValue = hasFormula && !isEditing ? displayValue : cell;
                    
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
                          value={showValue}
                          onChange={(e) => updateTableCell(sectionIndex, item.id, ri, ci, e.target.value)}
                          onKeyDown={(e) => handleCellKeyDown(e, item.id, ri, ci, cell)}
                          onFocus={() => handleCellFocus(item.id, ri, ci)}
                          onBlur={() => handleCellBlur(item.id, ri, ci)}
                          className={cn(
                            "w-full p-3 bg-transparent focus:outline-none focus:bg-accent/50 min-w-[100px]",
                            ri === 0 ? "text-white font-semibold text-center" : "text-foreground",
                            hasFormula && !isEditing && "text-primary font-medium"
                          )}
                          placeholder={ri === 0 ? "Header" : "..."}
                          title={hasFormula ? `Formula: ${cell}` : undefined}
                        />
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
      {/* Section Tabs - Editable Names */}
      <div className="flex flex-wrap gap-2 p-3 bg-muted/50 rounded-t-lg border border-border border-b-0">
        {sections.map((sec, index) => (
          <div key={sec.id} className="relative group">
            {editingTitleIndex === index ? (
              <Input
                value={editingTitleValue}
                onChange={(e) => setEditingTitleValue(e.target.value)}
                onBlur={saveTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') saveTitle();
                  if (e.key === 'Escape') {
                    setEditingTitleIndex(null);
                    setEditingTitleValue("");
                  }
                }}
                autoFocus
                className="h-9 w-32 text-sm"
              />
            ) : (
              <Button
                variant={activeSection === index ? "default" : "ghost"}
                size="sm"
                onClick={() => onActiveSectionChange(index)}
                className={cn(
                  "transition-all duration-300 font-medium pr-8",
                  activeSection === index && "shadow-md"
                )}
                style={activeSection === index ? { backgroundColor: themeColor } : {}}
              >
                {sec.title}
              </Button>
            )}
            {/* Edit button - appears on hover */}
            {editingTitleIndex !== index && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  startEditingTitle(index);
                }}
                className={cn(
                  "absolute right-1 top-1/2 -translate-y-1/2 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity",
                  activeSection === index 
                    ? "text-white/70 hover:text-white hover:bg-white/20" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
                title="Edit section name"
              >
                <Pencil className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Active Section Content - Full height, no scroll box */}
      <Card className="flex-1 rounded-t-none border-t-0 overflow-visible">
        <div className="p-6">
          {/* Section Title - Editable */}
          <div className="flex items-center gap-3 mb-6 pb-3 border-b-2" style={{ borderColor: themeColor }}>
            <h2 
              className="text-xl font-bold"
              style={{ color: themeColor }}
            >
              {section?.title || "Untitled"}
            </h2>
            <button
              onClick={() => startEditingTitle(activeSection)}
              className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              title="Edit section name"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
          
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
          
          {/* Single tip at the bottom of the section */}
          {section?.items.some(item => item.type === "text") && (
            <p className="text-xs text-muted-foreground mt-6 pt-4 border-t border-border">
              💡 Tip: Select text, then click Bold/Italic/Underline to format. You can also use Ctrl+B, Ctrl+I, Ctrl+U
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SectionEditor;
