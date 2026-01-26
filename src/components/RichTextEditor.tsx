import { useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormattedText } from "./SectionEditor";

const FONT_SIZES = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];

interface RichTextEditorProps {
  text: FormattedText;
  onTextChange: (text: FormattedText) => void;
  onDelete: () => void;
}

const RichTextEditor = ({ text, onTextChange, onDelete }: RichTextEditorProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const lastContentRef = useRef<string>(text.content);
  const isUserTypingRef = useRef<boolean>(false);
  
  // Initialize content on mount only
  useEffect(() => {
    if (contentRef.current && !isUserTypingRef.current) {
      contentRef.current.innerHTML = text.content;
    }
    lastContentRef.current = text.content;
  }, []);
  
  // Only update from outside if content actually changed externally
  useEffect(() => {
    if (contentRef.current && text.content !== lastContentRef.current && !isUserTypingRef.current) {
      // This is an external update (not from user typing)
      // Only update if the element is not focused
      if (document.activeElement !== contentRef.current) {
        contentRef.current.innerHTML = text.content;
      }
      lastContentRef.current = text.content;
    }
  }, [text.content]);
  
  // Handle content change from contentEditable
  const handleContentChange = useCallback(() => {
    if (contentRef.current) {
      isUserTypingRef.current = true;
      const htmlContent = contentRef.current.innerHTML;
      lastContentRef.current = htmlContent;
      onTextChange({ ...text, content: htmlContent });
      // Reset the flag after a short delay to allow for state updates
      setTimeout(() => {
        isUserTypingRef.current = false;
      }, 50);
    }
  }, [text, onTextChange]);
  
  // Apply formatting to selected text using execCommand
  const applyFormatting = (command: string) => {
    document.execCommand(command, false);
    handleContentChange();
  };

  const updateFontSize = (val: string) => {
    onTextChange({ ...text, fontSize: parseInt(val) });
  };

  const updateAlignment = (alignment: 'left' | 'center' | 'right' | 'justify') => {
    onTextChange({ ...text, alignment });
  };
    
  return (
    <div className="flex flex-col gap-3 group bg-card border border-border rounded-lg p-4 shadow-sm">
      {/* Word-like Toolbar */}
      <div className="flex items-center gap-1 flex-wrap border-b border-border pb-3 mb-2">
        {/* Font Size */}
        <Select
          value={text.fontSize.toString()}
          onValueChange={updateFontSize}
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
        
        {/* Bold - applies to selection */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent losing selection
            applyFormatting('bold');
          }}
          title="Bold (Ctrl+B) - Select text first"
        >
          <Bold className="h-4 w-4" />
        </Button>
        
        {/* Italic - applies to selection */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormatting('italic');
          }}
          title="Italic (Ctrl+I) - Select text first"
        >
          <Italic className="h-4 w-4" />
        </Button>
        
        {/* Underline - applies to selection */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onMouseDown={(e) => {
            e.preventDefault();
            applyFormatting('underline');
          }}
          title="Underline (Ctrl+U) - Select text first"
        >
          <Underline className="h-4 w-4" />
        </Button>
        
        <div className="w-px h-6 bg-border mx-2" />
        
        {/* Text Alignment */}
        <Button
          variant={text.alignment === 'left' ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onClick={() => updateAlignment('left')}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant={text.alignment === 'center' ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onClick={() => updateAlignment('center')}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        
        <Button
          variant={text.alignment === 'right' ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onClick={() => updateAlignment('right')}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant={text.alignment === 'justify' ? "default" : "outline"}
          size="icon"
          className="h-9 w-9"
          onClick={() => updateAlignment('justify')}
          title="Justify"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>
        
        <div className="flex-1" />
        
        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onDelete}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-9 w-9"
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Rich Text Editor - contentEditable div with ref-based management */}
      <div
        ref={contentRef}
        contentEditable
        onInput={handleContentChange}
        data-placeholder="Start typing here... Select text and click Bold/Italic/Underline to format"
        className="w-full bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none p-4 text-foreground rounded-md min-h-[150px] empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground"
        style={{ 
          fontSize: `${text.fontSize}px`,
          textAlign: text.alignment || 'left',
          lineHeight: '1.6',
        }}
      />
    </div>
  );
};

export default RichTextEditor;
