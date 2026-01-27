import React, { useCallback, useEffect, useRef, useState } from "react";

import type { SectionItem } from "./SectionEditor";

type StripHtmlForPreview = (html: string) => string;

interface PreviewTextItemProps {
  item: SectionItem;
  sectionIndex: number;
  itemIndex: number;
  baseTextStyle: React.CSSProperties;
  stripHtmlForPreview: StripHtmlForPreview;
  onSectionChange: (sectionIndex: number, itemIndex: number, updates: Partial<SectionItem>) => void;
}

/**
 * Stable textarea editor for the Template Preview.
 * Kept as a separate component so it doesn't remount on every parent render,
 * which would otherwise limit editing to 1 character at a time.
 */
export const PreviewTextItem = ({
  item,
  sectionIndex,
  itemIndex,
  baseTextStyle,
  stripHtmlForPreview,
  onSectionChange,
}: PreviewTextItemProps) => {
  if (!item.text) return null;
  const text = item.text;

  // Local state prevents cursor jumps while typing.
  const [localValue, setLocalValue] = useState(() => {
    const hasHtml = /<[^>]+>/g.test(text.content);
    return hasHtml ? stripHtmlForPreview(text.content) : text.content;
  });

  const isTypingRef = useRef(false);

  // Sync local state with external changes (e.g. edits from SectionEditor).
  useEffect(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    const hasHtml = /<[^>]+>/g.test(text.content);
    const newValue = hasHtml ? stripHtmlForPreview(text.content) : text.content;
    setLocalValue(newValue);
  }, [text.content, stripHtmlForPreview]);

  // Convert HTML -> plain text once, then keep edits raw.
  useEffect(() => {
    const hasHtml = /<[^>]+>/g.test(text.content);
    if (!hasHtml) return;
    const cleaned = stripHtmlForPreview(text.content);
    if (cleaned === text.content) return;
    onSectionChange(sectionIndex, itemIndex, {
      text: { ...text, content: cleaned },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const lineCount = Math.max(1, Math.ceil((localValue.length * (text.fontSize / 11)) / 80));
  const minHeight = Math.max(24, lineCount * (text.fontSize * 1.5));

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData("text/plain");
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);

      isTypingRef.current = true;
      setLocalValue(newValue);
      onSectionChange(sectionIndex, itemIndex, {
        text: { ...text, content: newValue },
      });
    },
    [itemIndex, onSectionChange, sectionIndex, text]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      isTypingRef.current = true;
      setLocalValue(newValue);
      onSectionChange(sectionIndex, itemIndex, {
        text: { ...text, content: newValue },
      });
    },
    [itemIndex, onSectionChange, sectionIndex, text]
  );

  return (
    <textarea
      value={localValue}
      onChange={handleChange}
      onPaste={handlePaste}
      placeholder="[Text placeholder]"
      style={{
        ...baseTextStyle,
        fontSize: `${text.fontSize}px`,
        fontWeight: "normal",
        fontStyle: "normal",
        textDecoration: "none",
        textAlign: text.alignment || "justify",
        marginBottom: "12px",
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        overflowWrap: "break-word",
        wordBreak: "normal",
        color: "#000000",
        width: "100%",
        border: "none",
        background: "transparent",
        outline: "none",
        resize: "none",
        minHeight: `${minHeight}px`,
        overflow: "hidden",
        lineHeight: "1.5",
        display: "block",
      }}
      rows={Math.max(1, localValue.split("\n").length)}
      onInput={(e) => {
        const target = e.target as HTMLTextAreaElement;
        target.style.height = "auto";
        target.style.height = `${target.scrollHeight}px`;
      }}
    />
  );
};
