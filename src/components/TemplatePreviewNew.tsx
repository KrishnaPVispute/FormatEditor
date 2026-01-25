import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getDisplayValue } from "@/utils/tableFormulas";
import neilGhodadraLogo from "@/assets/neil-ghodadra-logo.jpg";
import paulGhattasLogo from "@/assets/paul-ghattas-logo.png";
import { Section, SectionItem } from "./SectionEditor";

export interface TemplateInfo {
  id: string;
  name: string;
  type: "LCA" | "LCP";
  doctorName: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "neil-ghodadra-lca", name: "Neil Ghodadra (LCA)", type: "LCA", doctorName: "NEIL GHODADRA, M.D." },
  { id: "paul-ghattas-lcp", name: "Paul Ghattas (LCP)", type: "LCP", doctorName: "Paul Ghattas, D.O." },
  { id: "david-gupte-lcp", name: "1937 LCP David", type: "LCP", doctorName: "Paul Ghattas, D.O." },
];

interface TemplatePreviewNewProps {
  template: TemplateInfo | null;
  sections: Section[];
  onSectionChange: (sectionIndex: number, itemIndex: number, updates: Partial<SectionItem>) => void;
  onTableCellChange: (sectionIndex: number, itemIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  activeSection: number;
  patientName?: string;
  patientAge?: string;
  patientDOB?: string;
  patientDOI?: string;
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const CONTENT_PADDING = 40;
const HEADER_HEIGHT = 80;
const FOOTER_HEIGHT = 60;
const CONTENT_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - (CONTENT_PADDING * 2);

const TemplatePreviewNew = ({ 
  template, 
  sections,
  onSectionChange,
  onTableCellChange,
  activeSection,
  patientName = "Mr. John Doe",
  patientAge = "38 years",
  patientDOB = "Month XX, 20XX",
  patientDOI = "Month XX, 20XX"
}: TemplatePreviewNewProps) => {
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to active section in preview
  useEffect(() => {
    const sectionRef = sectionRefs.current[activeSection];
    if (sectionRef) {
      sectionRef.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeSection]);

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
  const themeColor = isLCA ? '#CC7900' : '#2E74B5';
  const altRowColor = isLCA ? '#FFF5E6' : '#E6F0FA';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const baseTextStyle: React.CSSProperties = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '11px',
    lineHeight: '1.5',
  };

  const pageStyle: React.CSSProperties = {
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times New Roman, serif',
    fontSize: '11px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    margin: '0 auto 16px auto',
    position: 'relative',
    pageBreakAfter: 'always',
  };

  const renderTable = (
    rows: string[][], 
    sectionIndex: number, 
    itemIndex: number, 
    tableHeader?: string
  ) => {
    if (rows.length === 0) {
      return <p style={{ ...baseTextStyle, color: '#888', fontStyle: 'italic' }}>[No table data]</p>;
    }
    
    const isFormula = (value: string) => value.trim().startsWith('=');
    
    return (
      <div style={{ marginBottom: '16px' }}>
        {tableHeader && (
          <h3 style={{ 
            ...baseTextStyle, 
            fontWeight: 'bold', 
            fontSize: '13px', 
            marginBottom: '8px', 
            color: themeColor 
          }}>
            {tableHeader}
          </h3>
        )}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', ...baseTextStyle }}>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={`row-${ri}`}>
                  {row.map((cell, ci) => {
                    const displayValue = getDisplayValue(cell, rows);
                    const hasFormula = isFormula(cell);
                    return (
                      <td
                        key={`cell-${ri}-${ci}`}
                        style={{
                          border: '1px solid #ccc',
                          padding: '0',
                          backgroundColor: ri === 0 ? themeColor : (ri % 2 === 0 ? altRowColor : '#FFFFFF'),
                          color: ri === 0 ? '#FFFFFF' : '#000000',
                          fontWeight: ri === 0 ? 'bold' : 'normal',
                          textAlign: ri === 0 ? 'center' : 'left',
                          fontSize: '11px',
                        }}
                      >
                        <input
                          type="text"
                          value={hasFormula ? displayValue : cell}
                          onChange={(e) => onTableCellChange(sectionIndex, itemIndex, ri, ci, e.target.value)}
                          onFocus={(e) => {
                            if (hasFormula) e.target.value = cell;
                          }}
                          onBlur={(e) => {
                            if (isFormula(e.target.value)) {
                              e.target.value = getDisplayValue(e.target.value, rows);
                            }
                          }}
                          placeholder="-"
                          style={{
                            width: '100%',
                            padding: '6px 8px',
                            border: 'none',
                            background: 'transparent',
                            color: hasFormula ? '#0066cc' : 'inherit',
                            fontWeight: 'inherit',
                            textAlign: 'inherit',
                            fontSize: 'inherit',
                            outline: 'none',
                          }}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTextItem = (item: SectionItem, sectionIndex: number, itemIndex: number) => {
    if (!item.text) return null;
    
    return (
      <textarea
        value={item.text.content}
        onChange={(e) => onSectionChange(sectionIndex, itemIndex, {
          text: { ...item.text!, content: e.target.value }
        })}
        placeholder="[Text placeholder]"
        style={{
          ...baseTextStyle,
          fontSize: `${item.text.fontSize}px`,
          fontWeight: item.text.isBold ? 'bold' : 'normal',
          marginBottom: '12px',
          whiteSpace: 'pre-wrap',
          color: '#000000',
          width: '100%',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          resize: 'none',
          minHeight: '24px',
          overflow: 'hidden',
        }}
        rows={Math.max(1, (item.text.content.split('\n').length || 1))}
      />
    );
  };

  // Render LCA Cover Page
  const renderLCACoverPage = () => (
    <div style={pageStyle}>
      <div style={{ 
        height: `${A4_HEIGHT}px`, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '60px 50px 40px 50px',
      }}>
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

        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <p style={{ fontSize: '14px', color: '#000000', margin: '4px 0' }}>
            Board-Certified Orthopedic Surgeon
          </p>
          <p style={{ fontSize: '14px', color: '#000000', margin: '4px 0' }}>
            Certified Life Care Planner
          </p>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 'bold', color: '#000000', margin: 0 }}>
            LIFE CARE ANALYSIS
          </h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <p style={{ fontSize: '16px', color: '#000000', margin: '10px 0' }}>For</p>
          <p style={{ fontSize: '18px', color: '#5B9BD5', margin: '10px 0' }}>{patientName}</p>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{currentDate}</p>
        </div>

        <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: 'auto' }}>
          <p style={{ fontSize: '12px', color: '#5B9BD5', textAlign: 'center', margin: '0 0 8px 0' }}>1</p>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#CC7900', textAlign: 'center', margin: '0 0 10px 0' }}>
            NEIL GHODADRA, M.D.
          </p>
          <p style={{ fontSize: '9px', color: '#000000', textAlign: 'center', lineHeight: '1.4' }}>
            This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a Life Care Analysis (LCA). Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );

  // Render LCP Cover Page
  const renderLCPCoverPage = () => (
    <div style={pageStyle}>
      <div style={{ 
        height: `${A4_HEIGHT}px`, 
        display: 'flex', 
        flexDirection: 'column',
        padding: '40px 50px 40px 50px',
      }}>
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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#000000', margin: 0 }}>
            Paul Ghattas, D.O.
          </h1>
          <p style={{ fontSize: '12px', color: '#666666', margin: '4px 0 0 0' }}>
            Board Certified Orthopedic Surgeon
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '40px', marginBottom: '30px' }}>
          <h1 style={{ fontSize: '32px', fontWeight: 'bold', color: '#CC7900', margin: 0 }}>
            LIFE CARE PLAN
          </h1>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <p style={{ fontSize: '16px', fontWeight: 'bold', color: '#000000', margin: '10px 0' }}>
            Prepared for {patientName}
          </p>
          <p style={{ fontSize: '14px', color: '#000000', margin: '10px 0' }}>
            By Paul Ghattas, D.O.
          </p>
          <p style={{ fontSize: '13px', color: '#000000', margin: '10px 0' }}>
            Board-Certified Orthopedic Surgeon and Certified Life Care Planner
          </p>
        </div>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{currentDate}</p>
        </div>

        <div style={{ marginTop: '60px', marginLeft: 'auto', marginRight: '100px' }}>
          <p style={{ fontSize: '13px', color: '#000000', margin: '8px 0' }}>
            <strong>Age:</strong> {patientAge}
          </p>
          <p style={{ fontSize: '13px', color: '#000000', margin: '8px 0' }}>
            <strong>DOB:</strong> {patientDOB}
          </p>
          <p style={{ fontSize: '13px', color: '#000000', margin: '8px 0' }}>
            <strong>DOI:</strong> {patientDOI}
          </p>
        </div>

        <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
          <p style={{ fontSize: '12px', color: '#5B9BD5', textAlign: 'center', margin: '0 0 8px 0' }}>1</p>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#CC7900', textAlign: 'center', margin: 0 }}>
            PAUL GHATTAS, D.O.
          </p>
        </div>
      </div>
    </div>
  );

  // Render content page with header and footer
  const renderContentPage = (
    sectionIndex: number, 
    pageNumber: number, 
    content: React.ReactNode
  ) => {
    const logo = isLCA ? neilGhodadraLogo : paulGhattasLogo;
    const doctorName = isLCA ? 'NEIL GHODADRA, M.D.' : 'PAUL GHATTAS, D.O.';
    const reportType = isLCA ? 'Life Care Analysis (LCA)' : 'Life Care Plan (LCP)';
    const section = sections[sectionIndex];

    return (
      <div 
        key={`page-${sectionIndex}-${pageNumber}`} 
        style={pageStyle}
        ref={el => sectionRefs.current[sectionIndex] = el}
        data-section-index={sectionIndex}
      >
        {/* Page Header */}
        <div style={{ 
          padding: '20px 40px', 
          borderBottom: `2px solid ${themeColor}`, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          height: `${HEADER_HEIGHT}px`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img src={logo} alt="Logo" style={{ height: '40px', width: 'auto' }} />
            <span style={{ fontSize: '12px', fontWeight: 'bold', color: themeColor }}>
              {doctorName}
            </span>
          </div>
          <span style={{ fontSize: '11px', color: '#666' }}>Page {pageNumber}</span>
        </div>

        {/* Content Area - No fixed height, content flows naturally */}
        <div style={{ 
          padding: `${CONTENT_PADDING}px`, 
          minHeight: `${CONTENT_HEIGHT}px`,
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: themeColor,
            marginBottom: '12px',
            borderBottom: `1px solid ${themeColor}`,
            paddingBottom: '6px',
          }}>
            Section {sectionIndex + 1}: {section?.title || `Content Block ${sectionIndex + 1}`}
          </h2>
          
          <div style={{ paddingLeft: '10px' }}>
            {content}
          </div>
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
          height: `${FOOTER_HEIGHT}px`,
        }}>
          <p style={{ 
            fontSize: '9px', 
            color: '#666',
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

  // Render section content
  const renderSectionContent = (section: Section, sectionIndex: number) => {
    return section.items.map((item, itemIndex) => (
      <div key={item.id}>
        {item.type === "text" && renderTextItem(item, sectionIndex, itemIndex)}
        {item.type === "table" && item.tableData && 
          renderTable(item.tableData.rows, sectionIndex, itemIndex, item.tableData.header)
        }
      </div>
    ));
  };

  // Generate pages for each section
  const renderSectionPages = () => {
    const pages: React.ReactNode[] = [];
    let pageNumber = 2;

    sections.forEach((section, sectionIndex) => {
      if (section.items.length > 0) {
        pages.push(
          renderContentPage(
            sectionIndex,
            pageNumber,
            renderSectionContent(section, sectionIndex)
          )
        );
        pageNumber++;
      }
    });

    return pages;
  };

  return (
    <div id="template-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Cover Page */}
      {isLCA ? renderLCACoverPage() : renderLCPCoverPage()}

      {/* Section Pages */}
      {renderSectionPages()}

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

export default TemplatePreviewNew;
