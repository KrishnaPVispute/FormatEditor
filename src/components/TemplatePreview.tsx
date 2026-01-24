import { Card } from "@/components/ui/card";
import { TextItem } from "./TextSection";
import { TableData } from "./TableSection";
import { MixedItem } from "./MixedSection";
import { FileText } from "lucide-react";
import { getDisplayValue } from "@/utils/tableFormulas";
import neilGhodadraLogo from "@/assets/neil-ghodadra-logo.jpg";
import paulGhattasLogo from "@/assets/paul-ghattas-logo.png";

export interface TemplateInfo {
  id: string;
  name: string;
  type: "LCA" | "LCP";
  doctorName: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "neil-ghodadra-lca", name: "Neil Ghodadra (LCA)", type: "LCA", doctorName: "NEIL GHODADRA, M.D." },
  { id: "paul-ghattas-lcp", name: "Paul Ghattas (LCP)", type: "LCP", doctorName: "Paul Ghattas, D.O." },
];

interface TemplatePreviewProps {
  template: TemplateInfo | null;
  textItems: TextItem[];
  tableData: TableData;
  mixedItems: MixedItem[];
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const FONT_SIZE = "11px";

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

  const isLCA = template.type === "LCA";
  const headerColor = isLCA ? '#CC7900' : '#CC7900'; // Orange/gold for both based on templates
  const lcpBlue = '#2E74B5';
  const altRowColor = isLCA ? '#FFF5E6' : '#E6F0FA';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const getPatientName = () => {
    const nameItem = textItems.find(item => 
      item.content.toLowerCase().includes('patient') || 
      item.content.toLowerCase().includes('claimant') ||
      item.content.toLowerCase().includes('mr.') ||
      item.content.toLowerCase().includes('ms.')
    );
    return nameItem?.content || "Mr. John Doe";
  };

  const baseTextStyle: React.CSSProperties = {
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

  const renderTable = (rows: string[][], tableId?: string, tableHeader?: string) => {
    if (rows.length === 0) {
      return <p style={{ ...baseTextStyle, color: '#888', fontStyle: 'italic' }}>[No table data]</p>;
    }
    const tableHeaderColor = isLCA ? '#CC7900' : '#2E74B5';
    return (
      <div style={{ marginBottom: '16px' }}>
        {tableHeader && (
          <h3 style={{ 
            ...baseTextStyle, 
            fontWeight: 'bold', 
            fontSize: '13px', 
            marginBottom: '8px', 
            color: tableHeaderColor 
          }}>
            {tableHeader}
          </h3>
        )}
        <div style={{ overflowX: 'auto' }}>
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
                        backgroundColor: ri === 0 ? tableHeaderColor : (ri % 2 === 0 ? altRowColor : '#FFFFFF'),
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

  const pageStyle: React.CSSProperties = {
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times New Roman, serif',
    fontSize: FONT_SIZE,
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    margin: '0 auto',
    position: 'relative',
  };

  // Render LCA Cover Page (Neil Ghodadra)
  const renderLCACoverPage = () => (
    <div style={pageStyle}>
      <div style={{ 
        height: `${A4_HEIGHT}px`, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '60px 50px 40px 50px',
      }}>
        {/* Logo and Header - centered at top */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          marginBottom: '40px',
        }}>
          <img 
            src={neilGhodadraLogo} 
            alt="NG Logo" 
            style={{ height: '120px', width: 'auto', marginBottom: '20px' }}
          />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: 0,
          }}>
            NEIL GHODADRA, M.D.
          </h1>
        </div>

        {/* Credentials */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ 
            fontSize: '14px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '4px 0',
          }}>
            Board-Certified Orthopedic Surgeon
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '4px 0',
          }}>
            Certified Life Care Planner
          </p>
        </div>

        {/* Main Title */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: 0,
          }}>
            LIFE CARE ANALYSIS
          </h1>
        </div>

        {/* For Patient */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ 
            fontSize: '16px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
          }}>
            For
          </p>
          <p style={{ 
            fontSize: '18px', 
            color: '#5B9BD5',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
          }}>
            {getPatientName()}
          </p>
        </div>

        {/* Date */}
        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
          }}>
            {currentDate}
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          borderTop: '1px solid #ddd',
          paddingTop: '20px',
          marginTop: 'auto',
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#5B9BD5',
            fontFamily: 'Times New Roman, serif',
            textAlign: 'center',
            margin: '0 0 8px 0',
          }}>
            1
          </p>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: '#CC7900',
            fontFamily: 'Times New Roman, serif',
            textAlign: 'center',
            margin: '0 0 10px 0',
          }}>
            NEIL GHODADRA, M.D.
          </p>
          <p style={{ 
            fontSize: '9px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            textAlign: 'center',
            lineHeight: '1.4',
          }}>
            This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a Life Care Analysis (LCA). Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );

  // Render LCP Cover Page (Paul Ghattas)
  const renderLCPCoverPage = () => (
    <div style={pageStyle}>
      <div style={{ 
        height: `${A4_HEIGHT}px`, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '40px 50px 40px 50px',
      }}>
        {/* Logo and Header - centered at top */}
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          marginBottom: '20px',
        }}>
          <img 
            src={paulGhattasLogo} 
            alt="PG Logo" 
            style={{ height: '100px', width: 'auto', marginBottom: '15px' }}
          />
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: 0,
          }}>
            Paul Ghattas, D.O.
          </h1>
          <p style={{ 
            fontSize: '12px', 
            color: '#666666',
            fontFamily: 'Times New Roman, serif',
            margin: '4px 0 0 0',
          }}>
            Board Certified Orthopedic Surgeon
          </p>
        </div>

        {/* Main Title */}
        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 'bold', 
            color: '#CC7900',
            fontFamily: 'Times New Roman, serif',
            margin: 0,
          }}>
            LIFE CARE PLAN
          </h1>
        </div>

        {/* Prepared for Patient */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <p style={{ 
            fontSize: '16px', 
            fontWeight: 'bold',
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
          }}>
            Prepared for {getPatientName()}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
          }}>
            By Paul Ghattas, D.O.
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '10px 0',
          }}>
            Board-Certified Orthopedic Surgeon and Certified Life Care Planner
          </p>
        </div>

        {/* Date */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ 
            fontSize: '14px', 
            fontWeight: 'bold',
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
          }}>
            {currentDate}
          </p>
        </div>

        {/* Patient Details - right aligned */}
        <div style={{ 
          marginTop: '60px',
          marginLeft: 'auto',
          marginRight: '100px',
        }}>
          <p style={{ 
            fontSize: '13px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '8px 0',
          }}>
            <strong>Age:</strong> XX years
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '8px 0',
          }}>
            <strong>DOB:</strong> Month XX, 20XX
          </p>
          <p style={{ 
            fontSize: '13px', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: '8px 0',
          }}>
            <strong>DOI:</strong> Month XX, 20XX
          </p>
        </div>

        {/* Footer */}
        <div style={{ 
          marginTop: 'auto',
          paddingTop: '20px',
        }}>
          <p style={{ 
            fontSize: '12px', 
            color: '#5B9BD5',
            fontFamily: 'Times New Roman, serif',
            textAlign: 'center',
            margin: '0 0 8px 0',
          }}>
            1
          </p>
          <p style={{ 
            fontSize: '12px', 
            fontWeight: 'bold',
            color: '#CC7900',
            fontFamily: 'Times New Roman, serif',
            textAlign: 'center',
            margin: 0,
          }}>
            PAUL GHATTAS, D.O.
          </p>
        </div>
      </div>
    </div>
  );

  // Render Content Pages
  const renderContentPages = () => {
    const tableHeaderColor = isLCA ? '#CC7900' : '#2E74B5';
    const logo = isLCA ? neilGhodadraLogo : paulGhattasLogo;
    const doctorName = isLCA ? 'NEIL GHODADRA, M.D.' : 'PAUL GHATTAS, D.O.';
    const reportType = isLCA ? 'Life Care Analysis (LCA)' : 'Life Care Plan (LCP)';

    return (
      <div style={pageStyle}>
        {/* Page Header */}
        <div style={{ 
          padding: '20px 40px', 
          borderBottom: `2px solid ${tableHeaderColor}`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img 
              src={logo} 
              alt="Logo" 
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
            <span style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: tableHeaderColor,
              fontFamily: 'Times New Roman, serif',
            }}>
              {doctorName}
            </span>
          </div>
        </div>

        {/* Content Area */}
        <div style={{ padding: '30px 40px', overflow: 'hidden' }}>
          {/* Section 1: Text Content */}
          {textItems.length > 0 && (
            <div style={{ marginBottom: '30px' }}>
              <h2 style={{ 
                fontSize: '16px', 
                fontWeight: 'bold', 
                color: tableHeaderColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: `1px solid ${tableHeaderColor}`,
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
                color: tableHeaderColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: `1px solid ${tableHeaderColor}`,
                paddingBottom: '6px',
              }}>
                {tableData.header || (isLCA ? "Total Expenditures" : "Summary Cost Projection Tables")}
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
                color: tableHeaderColor,
                fontFamily: 'Times New Roman, serif',
                marginBottom: '12px',
                borderBottom: `1px solid ${tableHeaderColor}`,
                paddingBottom: '6px',
              }}>
                {isLCA ? "Detailed Analysis" : "Future Medical Requirements"}
              </h2>
              <div style={{ paddingLeft: '10px' }}>
                {renderMixedContent()}
              </div>
            </div>
          )}

          {/* Show placeholder if no content */}
          {textItems.length === 0 && tableData.rows.length === 0 && mixedItems.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
              <p style={baseTextStyle}>Add content in the sections on the left to populate this template.</p>
            </div>
          )}
        </div>

        {/* Page Footer */}
        <div style={{ 
          padding: '15px 40px',
          borderTop: '1px solid #ddd',
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: '#FFFFFF',
        }}>
          <p style={{ 
            fontSize: '9px', 
            color: '#666',
            fontFamily: 'Times New Roman, serif',
            fontStyle: 'italic',
            textAlign: 'center',
            lineHeight: '1.4',
            margin: 0,
          }}>
            This report is confidential and protected by attorney-client privilege. 
            It is intended solely for the named recipient and contains information 
            related to a {reportType}. 
            Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div id="template-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Page 1 - Cover Page */}
      {isLCA ? renderLCACoverPage() : renderLCPCoverPage()}

      {/* Page 2+ - Content Pages (only if there's content) */}
      {(textItems.length > 0 || tableData.rows.length > 0 || mixedItems.length > 0) && renderContentPages()}

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