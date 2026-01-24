import { Card } from "@/components/ui/card";
import { TextItem } from "./TextSection";
import { TableData } from "./TableSection";
import { MixedItem } from "./MixedSection";
import { FileText } from "lucide-react";
import lcaLogo from "@/assets/lca-logo.png";
import lcpLogo from "@/assets/lcp-logo.png";

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

  const isLCA = template === "LCA";
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Extract patient name from textItems if available
  const getPatientName = () => {
    const nameItem = textItems.find(item => 
      item.content.toLowerCase().includes('patient') || 
      item.content.toLowerCase().includes('claimant') ||
      item.content.toLowerCase().includes('mr.') ||
      item.content.toLowerCase().includes('ms.')
    );
    return nameItem?.content || "Mr. John Doe";
  };

  const renderTextContent = () => {
    return textItems.map((item) => {
      if (item.type === "heading") {
        return (
          <h2 key={item.id} className="text-lg font-bold text-foreground mb-3" style={{ fontFamily: 'Times New Roman, serif' }}>
            {item.content || "[Heading placeholder]"}
          </h2>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} className="text-foreground mb-2 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
            {item.content || "[Text line placeholder]"}
          </p>
        );
      }
      return (
        <p key={item.id} className="text-foreground mb-4 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
          {item.content || "[Paragraph placeholder]"}
        </p>
      );
    });
  };

  // LCA Table styling - Orange/gold header
  const renderLCATable = () => {
    if (tableData.rows.length === 0) {
      return <p className="text-muted-foreground text-sm italic">[No table data]</p>;
    }
    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
          <tbody>
            {tableData.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border border-border p-2 ${
                      ri === 0 
                        ? "font-bold text-center" 
                        : "text-left"
                    }`}
                    style={{
                      backgroundColor: ri === 0 ? '#CC7900' : (ri % 2 === 0 ? '#FFF5E6' : '#FFFFFF'),
                      color: ri === 0 ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // LCP Table styling - Blue header
  const renderLCPTable = () => {
    if (tableData.rows.length === 0) {
      return <p className="text-muted-foreground text-sm italic">[No table data]</p>;
    }
    return (
      <div className="overflow-x-auto mb-6">
        <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
          <tbody>
            {tableData.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    className={`border border-border p-2 ${
                      ri === 0 
                        ? "font-bold text-center" 
                        : "text-left"
                    }`}
                    style={{
                      backgroundColor: ri === 0 ? '#2E74B5' : (ri % 2 === 0 ? '#E6F0FA' : '#FFFFFF'),
                      color: ri === 0 ? '#FFFFFF' : '#000000',
                    }}
                  >
                    {cell || "-"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderMixedContent = () => {
    return mixedItems.map((item) => {
      if (item.type === "heading") {
        return (
          <h3 key={item.id} className="text-base font-bold text-foreground mb-2" style={{ fontFamily: 'Times New Roman, serif' }}>
            {item.content || "[Heading]"}
          </h3>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} className="text-foreground mb-2 text-sm" style={{ fontFamily: 'Times New Roman, serif' }}>
            {item.content || "[Text]"}
          </p>
        );
      }
      if (item.type === "paragraph") {
        return (
          <p key={item.id} className="text-foreground mb-4 whitespace-pre-wrap text-sm leading-relaxed" style={{ fontFamily: 'Times New Roman, serif' }}>
            {item.content || "[Paragraph]"}
          </p>
        );
      }
      if (item.type === "table" && item.tableData) {
        return (
          <div key={item.id} className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-xs" style={{ fontFamily: 'Times New Roman, serif' }}>
              <tbody>
                {item.tableData.rows.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td
                        key={ci}
                        className={`border border-border p-2 ${
                          ri === 0 
                            ? "font-bold text-center" 
                            : "text-left"
                        }`}
                        style={{
                          backgroundColor: ri === 0 
                            ? (isLCA ? '#CC7900' : '#2E74B5') 
                            : (ri % 2 === 0 ? (isLCA ? '#FFF5E6' : '#E6F0FA') : '#FFFFFF'),
                          color: ri === 0 ? '#FFFFFF' : '#000000',
                        }}
                      >
                        {cell || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="space-y-4">
      {/* Page 1 - Cover Page */}
      <Card className="bg-white overflow-hidden shadow-lg" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Header with Logo */}
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-4">
            <img 
              src={isLCA ? lcaLogo : lcpLogo} 
              alt={isLCA ? "LCA Logo" : "LCP Logo"} 
              className="h-16 w-auto object-contain"
            />
            <div>
              <h1 className="text-xl font-bold" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
                {isLCA ? "NEIL GHODADRA, M.D." : "Paul Ghattas, D.O."}
              </h1>
              <p className="text-sm text-muted-foreground">
                Board-Certified Orthopedic Surgeon
              </p>
              <p className="text-sm text-muted-foreground">
                Certified Life Care Planner
              </p>
            </div>
          </div>
        </div>

        {/* Main Title */}
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
            {isLCA ? "LIFE CARE ANALYSIS" : "LIFE CARE PLAN"}
          </h1>
          <p className="text-lg mb-2">
            {isLCA ? "For" : "Prepared for"} {getPatientName()}
          </p>
          {!isLCA && (
            <p className="text-base mb-2">
              By Paul Ghattas, D.O.
            </p>
          )}
          <p className="text-base text-muted-foreground">
            {currentDate}
          </p>
        </div>

        {/* Confidentiality Notice */}
        <div className="px-8 pb-6">
          <p className="text-xs text-muted-foreground italic leading-relaxed">
            This report is confidential and protected by attorney-client privilege. 
            It is intended solely for the named recipient and contains information 
            related to a {isLCA ? "Life Care Analysis (LCA)" : "Life Care Plan (LCP)"}. 
            Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </Card>

      {/* Page 2 - Content Pages */}
      <Card className="bg-white overflow-hidden shadow-lg" style={{ fontFamily: 'Times New Roman, serif' }}>
        {/* Page Header */}
        <div className="px-6 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img 
              src={isLCA ? lcaLogo : lcpLogo} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-xs font-bold" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
              {isLCA ? "NEIL GHODADRA, M.D." : "Paul Ghattas, D.O."}
            </span>
          </div>
        </div>

        {/* Section 1: Text Content */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold mb-4" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
            {isLCA ? "Life Care Analysis" : "Overview"}
          </h2>
          <div className="pl-2">
            {textItems.length > 0 ? renderTextContent() : (
              <p className="text-muted-foreground text-sm italic">
                [Add content in Section 1 to populate this area]
              </p>
            )}
          </div>
        </div>

        {/* Section 2: Table Data */}
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-bold mb-4" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
            {isLCA ? "Total Expenditures" : "Summary Cost Projection Tables"}
          </h2>
          <div className="pl-2">
            {tableData.rows.length > 0 ? (isLCA ? renderLCATable() : renderLCPTable()) : (
              <p className="text-muted-foreground text-sm italic">
                [Add table data in Section 2 to populate this area]
              </p>
            )}
          </div>
        </div>

        {/* Section 3: Mixed Content */}
        <div className="p-6">
          <h2 className="text-lg font-bold mb-4" style={{ color: isLCA ? '#CC7900' : '#2E74B5' }}>
            {isLCA ? "Detailed Analysis" : "Future Medical Requirements"}
          </h2>
          <div className="pl-2">
            {mixedItems.length > 0 ? renderMixedContent() : (
              <p className="text-muted-foreground text-sm italic">
                [Add mixed content in Section 3 to populate this area]
              </p>
            )}
          </div>
        </div>

        {/* Page Footer */}
        <div className="px-6 py-3 border-t border-border">
          <p className="text-xs text-muted-foreground italic text-center">
            This report is confidential and protected by attorney-client privilege. 
            It is intended solely for the named recipient and contains information 
            related to a {isLCA ? "Life Care Analysis (LCA)" : "Life Care Plan (LCP)"}. 
            Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </Card>

      {/* Template Info Footer */}
      <div className="flex justify-between items-center text-sm text-muted-foreground px-2">
        <span>Generated: {currentDate}</span>
        <span>{isLCA ? "LCA Template v1.0" : "LCP Template v1.0"}</span>
      </div>
    </div>
  );
};

export default TemplatePreview;
