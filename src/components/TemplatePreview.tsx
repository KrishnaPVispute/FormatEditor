import { Card } from "@/components/ui/card";
import { TextItem } from "./TextSection";
import { TableData } from "./TableSection";
import { MixedItem } from "./MixedSection";
import { HeadingTableItem } from "./HeadingTableSection";
import { FileText } from "lucide-react";
import { getDisplayValue } from "@/utils/tableFormulas";
import lcaLogo from "@/assets/lca-logo.png";
import lcpLogo from "@/assets/lcp-logo.png";
import lcaCover from "@/assets/lca-cover.jpg";
import lcpCover from "@/assets/lcp-cover.jpg";

export interface TemplateInfo {
  id: string;
  name: string;
  type: "LCA" | "LCP";
  doctorName: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "neil-ghodadra-lca", name: "Neil Ghodadra (LCA)", type: "LCA", doctorName: "NEIL GHODADRA, M.D." },
  { id: "stanley-graves-lca", name: "Stanley Graves (LCA)", type: "LCA", doctorName: "Stanley Graves, M.D." },
  { id: "yusef-imani-lca", name: "Yusef Imani (LCA)", type: "LCA", doctorName: "Yusef Imani, M.D." },
  { id: "paul-ghattas-lcp", name: "Paul Ghattas (LCP)", type: "LCP", doctorName: "Paul Ghattas, D.O." },
];

interface TemplatePreviewProps {
  template: TemplateInfo | null;
  textItems: TextItem[];
  tableData: TableData;
  mixedItems: MixedItem[];
  headingTableItems: HeadingTableItem[];
}

// A4 dimensions in pixels at 96 DPI: 794 x 1123 (210mm x 297mm)
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const FONT_SIZE = "11px"; // Fixed font size

const TemplatePreview = ({ template, textItems, tableData, mixedItems, headingTableItems }: TemplatePreviewProps) => {
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

  const isLCA = template.type === "LCA";
  const headerColor = isLCA ? '#CC7900' : '#2E74B5';
  const altRowColor = isLCA ? '#FFF5E6' : '#E6F0FA';
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

  const baseTextStyle = {
    fontFamily: 'Times New Roman, serif',
    fontSize: FONT_SIZE,
    lineHeight: '1.5',
  };

  const renderTextContent = () => {
    return textItems.map((item) => {
      if (item.type === "heading") {
        return (
          <h2 
            key={item.id} 
            style={{ 
              ...baseTextStyle,
              fontWeight: 'bold',
              fontSize: '14px',
              marginBottom: '8px',
              color: '#000000',
            }}
          >
            {item.content || "[Heading placeholder]"}
          </h2>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} style={{ ...baseTextStyle, marginBottom: '4px', color: '#000000' }}>
            {item.content || "[Text line placeholder]"}
          </p>
        );
      }
      return (
        <p key={item.id} style={{ ...baseTextStyle, marginBottom: '12px', whiteSpace: 'pre-wrap', color: '#000000' }}>
          {item.content || "[Paragraph placeholder]"}
        </p>
      );
    });
  };

  const renderTable = (rows: string[][], tableId?: string) => {
    if (rows.length === 0) {
      return <p style={{ ...baseTextStyle, color: '#888', fontStyle: 'italic' }}>[No table data]</p>;
    }
    return (
      <div style={{ overflowX: 'auto', marginBottom: '16px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', ...baseTextStyle }}>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={`${tableId || 'table'}-row-${ri}`}>
                {row.map((cell, ci) => (
                  <td
                    key={`${tableId || 'table'}-cell-${ri}-${ci}`}
                    style={{
                      border: '1px solid #ccc',
                      padding: '6px 8px',
                      backgroundColor: ri === 0 ? headerColor : (ri % 2 === 0 ? altRowColor : '#FFFFFF'),
                      color: ri === 0 ? '#FFFFFF' : '#000000',
                      fontWeight: ri === 0 ? 'bold' : 'normal',
                      textAlign: ri === 0 ? 'center' : 'left',
                      fontSize: FONT_SIZE,
                    }}
                  >
                    {getDisplayValue(cell, rows) || "-"}
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
          <h3 key={item.id} style={{ ...baseTextStyle, fontWeight: 'bold', fontSize: '13px', marginBottom: '6px', color: '#000000' }}>
            {item.content || "[Heading]"}
          </h3>
        );
      }
      if (item.type === "text") {
        return (
          <p key={item.id} style={{ ...baseTextStyle, marginBottom: '4px', color: '#000000' }}>
            {item.content || "[Text]"}
          </p>
        );
      }
      if (item.type === "paragraph") {
        return (
          <p key={item.id} style={{ ...baseTextStyle, marginBottom: '12px', whiteSpace: 'pre-wrap', color: '#000000' }}>
            {item.content || "[Paragraph]"}
          </p>
        );
      }
      if (item.type === "table" && item.tableData) {
        return (
          <div key={item.id}>
            {renderTable(item.tableData.rows, item.id)}
          </div>
        );
      }
      return null;
    });
  };

  const renderHeadingTables = () => {
    return headingTableItems.map((item) => (
      <div key={item.id} style={{ marginBottom: '20px' }}>
        <h3 style={{ ...baseTextStyle, fontWeight: 'bold', fontSize: '13px', marginBottom: '8px', color: headerColor }}>
          {item.heading || "[Table Heading]"}
        </h3>
        {renderTable(item.tableData.rows, item.id)}
      </div>
    ));
  };

  const pageStyle = {
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times New Roman, serif',
    fontSize: FONT_SIZE,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    margin: '0 auto',
  };

  return (
    <div id="template-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page 1 - Cover Page (Using exact template structure) */}
      <div style={pageStyle}>
        {/* Cover page with background image showing the exact template design */}
        <div style={{ 
          width: '100%', 
          height: `${A4_HEIGHT}px`, 
          position: 'relative',
          backgroundImage: `url(${isLCA ? lcaCover : lcpCover})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}>
          {/* Overlay for content - positioned to match template */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header with logo - matching template */}
            <div style={{ 
              padding: '40px 50px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
            }}>
              <img 
                src={isLCA ? lcaLogo : lcpLogo} 
                alt="Logo" 
                style={{ height: '80px', width: 'auto', objectFit: 'contain' }}
              />
              <div>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold', 
                  color: headerColor,
                  fontFamily: 'Times New Roman, serif',
                  margin: 0,
                }}>
                  {template.doctorName}
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#333',
                  fontFamily: 'Times New Roman, serif',
                  margin: '4px 0 0 0',
                }}>
                  Board-Certified Orthopedic Surgeon
                </p>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#333',
                  fontFamily: 'Times New Roman, serif',
                  margin: '2px 0 0 0',
                }}>
                  Certified Life Care Planner
                </p>
              </div>
            </div>

            {/* Main Title Section - centered */}
            <div style={{ 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'center', 
              alignItems: 'center',
              padding: '0 50px',
            }}>
              <h1 style={{ 
                fontSize: '36px', 
                fontWeight: 'bold', 
                color: headerColor,
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                margin: '0 0 20px 0',
              }}>
                {isLCA ? "LIFE CARE ANALYSIS" : "LIFE CARE PLAN"}
              </h1>
              <p style={{ 
                fontSize: '20px', 
                color: '#000',
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                margin: '0 0 10px 0',
              }}>
                {isLCA ? "For" : "Prepared for"} {getPatientName()}
              </p>
              {!isLCA && (
                <p style={{ 
                  fontSize: '16px', 
                  color: '#333',
                  fontFamily: 'Times New Roman, serif',
                  textAlign: 'center',
                  margin: '0 0 10px 0',
                }}>
                  By {template.doctorName}
                </p>
              )}
              <p style={{ 
                fontSize: '16px', 
                color: '#333',
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                margin: '10px 0',
              }}>
                Board-Certified Orthopedic Surgeon and Certified Life Care Planner
              </p>
              <p style={{ 
                fontSize: '18px', 
                color: '#000',
                fontFamily: 'Times New Roman, serif',
                textAlign: 'center',
                margin: '20px 0 0 0',
              }}>
                {currentDate}
              </p>
            </div>

            {/* Confidentiality Notice at bottom */}
            <div style={{ 
              padding: '30px 50px',
            }}>
              <p style={{ 
                fontSize: '10px', 
                color: '#666',
                fontFamily: 'Times New Roman, serif',
                fontStyle: 'italic',
                textAlign: 'justify',
                lineHeight: '1.4',
              }}>
                This report is confidential and protected by attorney-client privilege. 
                It is intended solely for the named recipient and contains information 
                related to a {isLCA ? "Life Care Analysis (LCA)" : "Life Care Plan (LCP)"}. 
                Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page 2+ - Content Pages */}
      <div style={pageStyle}>
        {/* Page Header */}
        <div style={{ 
          padding: '20px 40px', 
          borderBottom: '2px solid ' + headerColor, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={isLCA ? lcaLogo : lcpLogo} 
              alt="Logo" 
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: headerColor,
              fontFamily: 'Times New Roman, serif',
            }}>
              {template.doctorName}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '30px 40px' }}>
          {/* Section 1: Text Content */}
          {textItems.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: headerColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: '1px solid ' + headerColor,
                paddingBottom: '6px',
              }}>
                {isLCA ? "Life Care Analysis" : "Overview"}
              </h2>
              <div style={{ paddingLeft: '10px' }}>
                {renderTextContent()}
              </div>
            </div>
          )}

          {/* Section 2: Table Data */}
          {tableData.rows.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: headerColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: '1px solid ' + headerColor,
                paddingBottom: '6px',
              }}>
                {isLCA ? "Total Expenditures" : "Summary Cost Projection Tables"}
              </h2>
              <div style={{ paddingLeft: '10px' }}>
                {renderTable(tableData.rows, 'main-table')}
              </div>
            </div>
          )}

          {/* Section 3: Mixed Content */}
          {mixedItems.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: headerColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: '1px solid ' + headerColor,
                paddingBottom: '6px',
              }}>
                {isLCA ? "Detailed Analysis" : "Future Medical Requirements"}
              </h2>
              <div style={{ paddingLeft: '10px' }}>
                {renderMixedContent()}
              </div>
            </div>
          )}

          {/* Section 4: Heading Tables */}
          {headingTableItems.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: headerColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: '1px solid ' + headerColor,
                paddingBottom: '6px',
              }}>
                Additional Tables
              </h2>
              <div style={{ paddingLeft: '10px' }}>
                {renderHeadingTables()}
              </div>
            </div>
          )}

          {/* Show placeholder if no content */}
          {textItems.length === 0 && tableData.rows.length === 0 && mixedItems.length === 0 && headingTableItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={baseTextStyle}>Add content in the sections on the left to populate this template.</p>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div style={{ 
          padding: '15px 40px',
          borderTop: '1px solid #ddd',
          marginTop: 'auto',
        }}>
          <p style={{ 
            fontSize: '9px', 
            color: '#666',
            fontFamily: 'Times New Roman, serif',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.4',
          }}>
            This report is confidential and protected by attorney-client privilege. 
            It is intended solely for the named recipient and contains information 
            related to a {isLCA ? "Life Care Analysis (LCA)" : "Life Care Plan (LCP)"}. 
            Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </div>

      {/* Template Info Footer */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '8px 16px',
        fontSize: '12px',
        color: '#888',
      }}>
        <span>Generated: {currentDate}</span>
        <span>{template.name} Template v1.0</span>
      </div>
    </div>
  );
};

export default TemplatePreview;
