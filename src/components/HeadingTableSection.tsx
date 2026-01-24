import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Heading1 } from "lucide-react";

export interface HeadingTableItem {
  id: string;
  heading: string;
  tableData: {
    rows: string[][];
  };
}

interface HeadingTableSectionProps {
  items: HeadingTableItem[];
  onChange: (items: HeadingTableItem[]) => void;
}

const HeadingTableSection = ({ items, onChange }: HeadingTableSectionProps) => {
  const addItem = () => {
    const newItem: HeadingTableItem = {
      id: crypto.randomUUID(),
      heading: "",
      tableData: {
        rows: [
          ["", "", ""],
          ["", "", ""],
        ],
      },
    };
    onChange([...items, newItem]);
  };

  const updateHeading = (id: string, heading: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, heading } : item)));
  };

  const updateTableCell = (id: string, rowIndex: number, colIndex: number, value: string) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newRows = item.tableData.rows.map((row, ri) =>
            ri === rowIndex
              ? row.map((cell, ci) => (ci === colIndex ? value : cell))
              : row
          );
          return { ...item, tableData: { rows: newRows } };
        }
        return item;
      })
    );
  };

  const addTableRow = (id: string) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const colCount = item.tableData.rows[0]?.length || 3;
          const newRow = Array(colCount).fill("");
          return { ...item, tableData: { rows: [...item.tableData.rows, newRow] } };
        }
        return item;
      })
    );
  };

  const addTableColumn = (id: string) => {
    onChange(
      items.map((item) => {
        if (item.id === id) {
          const newRows = item.tableData.rows.map((row) => [...row, ""]);
          return { ...item, tableData: { rows: newRows } };
        }
        return item;
      })
    );
  };

  const removeTableRow = (id: string, rowIndex: number) => {
    onChange(
      items.map((item) => {
        if (item.id === id && item.tableData.rows.length > 1) {
          return {
            ...item,
            tableData: { rows: item.tableData.rows.filter((_, i) => i !== rowIndex) },
          };
        }
        return item;
      })
    );
  };

  const removeTableColumn = (id: string, colIndex: number) => {
    onChange(
      items.map((item) => {
        if (item.id === id && item.tableData.rows[0]?.length > 1) {
          return {
            ...item,
            tableData: { rows: item.tableData.rows.map((row) => row.filter((_, i) => i !== colIndex)) },
          };
        }
        return item;
      })
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Section 4: Heading + Table</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={addItem}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <Heading1 className="h-4 w-4" />
          Add Heading Table
        </Button>
      </div>

      <div className="space-y-4 min-h-[100px] border border-input bg-background p-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add heading + table combinations using the button above.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="group border border-border p-3 bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground uppercase tracking-wide">
                  Heading + Table
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              <input
                type="text"
                value={item.heading}
                onChange={(e) => updateHeading(item.id, e.target.value)}
                placeholder="Enter table heading..."
                className="w-full text-xl font-bold bg-transparent border-b border-input focus:border-primary focus:outline-none py-1 mb-4 text-foreground placeholder:text-muted"
              />

              <div className="overflow-x-auto">
                <div className="flex gap-2 mb-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTableRow(item.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Row
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addTableColumn(item.id)}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Column
                  </Button>
                </div>
                <table className="w-full border-collapse">
                  <tbody>
                    {item.tableData.rows.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, colIndex) => (
                          <td key={colIndex} className="border border-input p-0">
                            <input
                              type="text"
                              value={cell}
                              onChange={(e) =>
                                updateTableCell(item.id, rowIndex, colIndex, e.target.value)
                              }
                              className="w-full p-2 bg-transparent focus:outline-none focus:bg-accent/50 text-foreground"
                              placeholder="..."
                            />
                          </td>
                        ))}
                        <td className="border-none p-1 w-8">
                          <button
                            onClick={() => removeTableRow(item.id, rowIndex)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
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
          ))
        )}
      </div>
    </Card>
  );
};

export default HeadingTableSection;
