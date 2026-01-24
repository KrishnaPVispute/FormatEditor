import { Card } from "@/components/ui/card";
import { TextItem } from "./TextSection";
import { TableData } from "./TableSection";
import { MixedItem } from "./MixedSection";
import { FileText } from "lucide-react";

interface TemplatePreviewProps {
  template: "LCA" | "LCP" | null;
  textItems: TextItem[];
  tableData: TableData;
  mixedItems: MixedItem[];
}

const TemplatePreview = ({ template, textItems, tableData, mixedItems }: TemplatePreviewProps) => {
  if (!template) {
    return (
      <Card className="p-8 bg-card min-h-[400px] flex flex-col items-center justify-center">
        <FileText className="h-16 w-16 text-muted mb-4" />
        <p className="text-muted-foreground text-center">
          Select a template and click Generate to preview the output.
        </p>
      </Card>
    );
  }

  const renderTextContent = () => {
    return textItems.map((item) => {
      if (item.type === "heading") {
        return (
          <h2 key={item.id} className="text-xl font-bold text-foreground mb-2">
            {item.content || "[Heading placeholder]"}
          </h2>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} className="text-foreground mb-1">
            {item.content || "[Text line placeholder]"}
          </p>
        );
      }
      return (
        <p key={item.id} className="text-foreground mb-3 whitespace-pre-wrap">
          {item.content || "[Paragraph placeholder]"}
        </p>
      );
    });
  };

  const renderTable = () => {
    if (tableData.rows.length === 0) {
      return <p className="text-muted-foreground">[No table data]</p>;
    }
    return (
      <table className="w-full border-collapse mb-4">
        <tbody>
          {tableData.rows.map((row, ri) => (
            <tr key={ri}>
              {row.map((cell, ci) => (
                <td
                  key={ci}
                  className={`border border-border p-2 ${
                    ri === 0 ? "bg-primary text-primary-foreground font-semibold" : "bg-card"
                  }`}
                >
                  {cell || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  const renderMixedContent = () => {
    return mixedItems.map((item) => {
      if (item.type === "heading") {
        return (
          <h3 key={item.id} className="text-lg font-bold text-foreground mb-2">
            {item.content || "[Heading]"}
          </h3>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} className="text-foreground mb-1">
            {item.content || "[Text]"}
          </p>
        );
      }
      if (item.type === "paragraph") {
        return (
          <p key={item.id} className="text-foreground mb-3 whitespace-pre-wrap">
            {item.content || "[Paragraph]"}
          </p>
        );
      }
      if (item.type === "table" && item.tableData) {
        return (
          <table key={item.id} className="w-full border-collapse mb-4">
            <tbody>
              {item.tableData.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`border border-border p-2 ${
                        ri === 0 ? "bg-secondary text-secondary-foreground font-semibold" : "bg-card"
                      }`}
                    >
                      {cell || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );
      }
      return null;
    });
  };

  const isLCA = template === "LCA";

  return (
    <Card className="bg-card overflow-hidden">
      {/* Template Header */}
      <div
        className={`p-6 ${
          isLCA ? "bg-primary" : "bg-secondary"
        } text-primary-foreground`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-foreground/20 flex items-center justify-center font-bold text-xl">
            {isLCA ? "LCA" : "LCP"}
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              {isLCA ? "Life Cycle Assessment" : "Life Cycle Planning"}
            </h1>
            <p className="text-primary-foreground/80 text-sm">
              {isLCA ? "Environmental Impact Report" : "Strategic Planning Document"}
            </p>
          </div>
        </div>
      </div>

      {/* Template Body */}
      <div className="p-6 space-y-6">
        {/* Section 1: Text Content */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 border-b border-border pb-2">
            {isLCA ? "Executive Summary" : "Planning Overview"}
          </h3>
          <div className="pl-2">{renderTextContent()}</div>
        </section>

        {/* Section 2: Table Data */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 border-b border-border pb-2">
            {isLCA ? "Impact Assessment Data" : "Resource Allocation"}
          </h3>
          <div className="pl-2">{renderTable()}</div>
        </section>

        {/* Section 3: Mixed Content */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 border-b border-border pb-2">
            {isLCA ? "Detailed Analysis" : "Implementation Details"}
          </h3>
          <div className="pl-2">{renderMixedContent()}</div>
        </section>
      </div>

      {/* Template Footer */}
      <div
        className={`p-4 ${
          isLCA ? "bg-primary/10" : "bg-secondary/10"
        } border-t border-border`}
      >
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Generated: {new Date().toLocaleDateString()}</span>
          <span>{isLCA ? "LCA Template v1.0" : "LCP Template v1.0"}</span>
        </div>
      </div>
    </Card>
  );
};

export default TemplatePreview;
