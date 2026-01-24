import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Type, AlignLeft, Heading1 } from "lucide-react";

export interface TextItem {
  id: string;
  type: "heading" | "text" | "paragraph";
  content: string;
}

interface TextSectionProps {
  items: TextItem[];
  onChange: (items: TextItem[]) => void;
}

const TextSection = ({ items, onChange }: TextSectionProps) => {
  const addItem = (type: TextItem["type"]) => {
    const newItem: TextItem = {
      id: crypto.randomUUID(),
      type,
      content: "",
    };
    onChange([...items, newItem]);
  };

  const updateItem = (id: string, content: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, content } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <Card className="p-6 bg-card">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">Section 1: Text Only</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem("heading")}
            className="flex items-center gap-1"
          >
            <Heading1 className="h-4 w-4" />
            Heading
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem("text")}
            className="flex items-center gap-1"
          >
            <Type className="h-4 w-4" />
            Line
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => addItem("paragraph")}
            className="flex items-center gap-1"
          >
            <AlignLeft className="h-4 w-4" />
            Paragraph
          </Button>
        </div>
      </div>

      <div className="space-y-3 min-h-[100px] border border-input bg-background p-4">
        {items.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            Add headings, text lines, or paragraphs using the buttons above.
          </p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="flex items-start gap-2 group">
              {item.type === "heading" ? (
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder="Enter heading..."
                  className="flex-1 text-xl font-bold bg-transparent border-b border-input focus:border-primary focus:outline-none py-1 text-foreground placeholder:text-muted"
                />
              ) : item.type === "text" ? (
                <input
                  type="text"
                  value={item.content}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder="Enter single line text..."
                  className="flex-1 bg-transparent border-b border-input focus:border-primary focus:outline-none py-1 text-foreground placeholder:text-muted"
                />
              ) : (
                <textarea
                  value={item.content}
                  onChange={(e) => updateItem(item.id, e.target.value)}
                  placeholder="Enter paragraph..."
                  rows={3}
                  className="flex-1 bg-transparent border border-input focus:border-primary focus:outline-none p-2 resize-y text-foreground placeholder:text-muted"
                />
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeItem(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </div>
    </Card>
  );
};

export default TextSection;
