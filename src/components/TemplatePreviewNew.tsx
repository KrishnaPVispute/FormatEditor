import React, { useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { getDisplayValue } from "@/utils/tableFormulas";
import neilGhodadraLogo from "@/assets/neil-ghodadra-logo.jpg";
import paulGhattasLogo from "@/assets/paul-ghattas-logo.png";
import stanleyGravesLogo from "@/assets/stanley-graves-logo.png";
import lcpDoctorProfile from "@/assets/lcp-doctor-profile.jpg";
import paulGhattasProfile from "@/assets/paul-ghattas-profile.jpg";
import neilGhodadraProfile from "@/assets/neil-ghodadra-profile.jpg";
import stanleyGravesProfile from "@/assets/stanley-graves-profile.jpg";
import { Section, SectionItem, FormattedText } from "./SectionEditor";

export interface TemplateInfo {
  id: string;
  name: string;
  type: "LCA" | "LCP";
  doctorName: string;
}

export const TEMPLATES: TemplateInfo[] = [
  { id: "neil-ghodadra-lca", name: "Neil Ghodadra (LCA)", type: "LCA", doctorName: "NEIL GHODADRA, M.D." },
  { id: "paul-ghattas-lcp", name: "Paul Ghattas (LCP)", type: "LCP", doctorName: "Paul Ghattas, D.O." },
  { id: "stanley-graves-lca", name: "Stanley Graves (LCA)", type: "LCA", doctorName: "STANLEY GRAVES, M.D." },
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
const CONTENT_HEIGHT = A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 80; // Available content height per page

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
  const isStanleyGraves = template.id === "stanley-graves-lca";
  // Stanley Graves uses a teal/green color theme, others use standard LCA/LCP colors
  const themeColor = isStanleyGraves ? '#2E8B57' : (isLCA ? '#CC7900' : '#2E74B5');
  const altRowColor = isStanleyGraves ? '#E6F5EE' : (isLCA ? '#FFF5E6' : '#E6F0FA');
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Get the correct doctor profile image based on template
  const getDoctorProfileImage = () => {
    if (template.id === "neil-ghodadra-lca") return neilGhodadraProfile;
    if (template.id === "paul-ghattas-lcp") return paulGhattasProfile;
    if (template.id === "stanley-graves-lca") return stanleyGravesProfile;
    return lcpDoctorProfile;
  };

  // Get the correct doctor logo based on template
  const getDoctorLogo = () => {
    if (template.id === "neil-ghodadra-lca") return neilGhodadraLogo;
    if (template.id === "paul-ghattas-lcp") return paulGhattasLogo;
    if (template.id === "stanley-graves-lca") return stanleyGravesLogo;
    return isLCA ? neilGhodadraLogo : paulGhattasLogo;
  };

  const baseTextStyle: React.CSSProperties = {
    fontFamily: 'Times New Roman, serif',
    fontSize: '11px',
    lineHeight: '1.5',
  };

  const pageStyle: React.CSSProperties = {
    width: `${A4_WIDTH}px`,
    minHeight: `${A4_HEIGHT}px`,
    height: 'auto', // Allow pages to grow for content
    backgroundColor: '#FFFFFF',
    fontFamily: 'Times New Roman, serif',
    fontSize: '11px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    margin: '0 auto 16px auto',
    position: 'relative',
    pageBreakAfter: 'always',
    pageBreakInside: 'avoid',
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
                          color: ri === 0 ? '#FFFFFF' : (hasFormula ? '#0066cc' : '#000000'),
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
                            color: 'inherit',
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

  // Helper to strip HTML and convert to clean text with proper line breaks
  const stripHtmlForPreview = (html: string): string => {
    // Replace div and br tags with newlines, then strip remaining HTML
    let text = html
      .replace(/<div>/gi, '\n')
      .replace(/<\/div>/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<p>/gi, '\n')
      .replace(/<\/p>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '');
    
    // Strip any remaining HTML tags
    const tmp = document.createElement('div');
    tmp.innerHTML = text;
    text = tmp.textContent || tmp.innerText || '';

    // Normalize Windows newlines and trim leading/trailing whitespace
    // But preserve internal multiple newlines that users add intentionally
    return text.replace(/\r\n/g, '\n').trim();
  };

  const renderTextItem = (item: SectionItem, sectionIndex: number, itemIndex: number) => {
    if (!item.text) return null;
    const text = item.text;
    
    // Check if content contains HTML tags - if so, strip them once for display
    // If it's already plain text (user edited in preview), use as-is
    const hasHtmlTags = /<[^>]+>/g.test(text.content);
    const displayContent = hasHtmlTags ? stripHtmlForPreview(text.content) : text.content;
    
    // Calculate approximate line count for auto-height
    const lineCount = Math.max(1, Math.ceil((displayContent.length * (text.fontSize / 11)) / 80));
    const minHeight = Math.max(24, lineCount * (text.fontSize * 1.5));
    
    // Handle paste event to preserve text structure
    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      e.preventDefault();
      const pastedText = e.clipboardData.getData('text/plain');
      const target = e.target as HTMLTextAreaElement;
      const start = target.selectionStart;
      const end = target.selectionEnd;
      const currentValue = target.value;
      const newValue = currentValue.substring(0, start) + pastedText + currentValue.substring(end);
      
      // Save as plain text directly
      onSectionChange(sectionIndex, itemIndex, {
        text: { ...text, content: newValue }
      });
    };
    
    // Handle text changes - save plain text directly so spacing is preserved
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onSectionChange(sectionIndex, itemIndex, {
        text: { ...text, content: e.target.value }
      });
    };
    
    return (
      <textarea
        value={displayContent}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="[Text placeholder]"
        style={{
          ...baseTextStyle,
          fontSize: `${text.fontSize}px`,
          fontWeight: 'normal',
          fontStyle: 'normal',
          textDecoration: 'none',
          textAlign: text.alignment || 'justify',
          marginBottom: '12px',
          whiteSpace: 'pre-wrap',
          wordWrap: 'break-word',
          overflowWrap: 'break-word',
          wordBreak: 'normal',
          color: '#000000',
          width: '100%',
          border: 'none',
          background: 'transparent',
          outline: 'none',
          resize: 'none',
          minHeight: `${minHeight}px`,
          overflow: 'hidden',
          lineHeight: '1.5',
          display: 'block',
        }}
        rows={Math.max(1, displayContent.split('\n').length)}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${target.scrollHeight}px`;
        }}
      />
    );
  };

  // Render Doctor Profile Section (for Section 10)
  const renderDoctorProfile = () => {
    const profileImage = getDoctorProfileImage();
    
    return (
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        border: `1px solid ${themeColor}`,
        borderRadius: '8px',
      }}>
        <img 
          src={profileImage} 
          alt="Doctor Profile" 
          style={{ 
            width: '100%', 
            maxHeight: '400px', 
            objectFit: 'contain',
            borderRadius: '4px',
          }}
        />
      </div>
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

  // Render Stanley Graves Cover Page
  const renderStanleyGravesCoverPage = () => (
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
            src={stanleyGravesLogo} 
            alt="SG Logo" 
            style={{ height: '100px', width: 'auto', marginBottom: '20px' }}
          />
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 'bold', 
            color: '#000000',
            fontFamily: 'Times New Roman, serif',
            margin: 0,
          }}>
            STANLEY GRAVES, M.D.
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
          <p style={{ fontSize: '18px', color: '#2E8B57', margin: '10px 0' }}>{patientName}</p>
        </div>

        <div style={{ textAlign: 'center', flex: 1 }}>
          <p style={{ fontSize: '14px', fontWeight: 'bold', color: '#000000' }}>{currentDate}</p>
        </div>

        <div style={{ borderTop: '1px solid #ddd', paddingTop: '20px', marginTop: 'auto' }}>
          <p style={{ fontSize: '12px', color: '#2E8B57', textAlign: 'center', margin: '0 0 8px 0' }}>1</p>
          <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#2E8B57', textAlign: 'center', margin: '0 0 10px 0' }}>
            STANLEY GRAVES, M.D.
          </p>
          <p style={{ fontSize: '9px', color: '#000000', textAlign: 'center', lineHeight: '1.4' }}>
            This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a Life Care Analysis (LCA). Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.
          </p>
        </div>
      </div>
    </div>
  );

  // Render content page with header and footer
  const renderContentPage = (
    sectionIndex: number, 
    pageNumber: number, 
    content: React.ReactNode,
    isLastSection: boolean = false
  ) => {
    const logo = getDoctorLogo();
    const doctorName = isStanleyGraves ? 'STANLEY GRAVES, M.D.' : (isLCA ? 'NEIL GHODADRA, M.D.' : 'PAUL GHATTAS, D.O.');
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

        {/* Content Area - Allow natural content flow for long content */}
        <div style={{ 
          padding: `${CONTENT_PADDING}px`, 
          minHeight: `${A4_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - 40}px`,
          paddingBottom: `${FOOTER_HEIGHT + 20}px`, // Extra padding for footer
        }}>
          <h2 style={{ 
            fontSize: '16px', 
            fontWeight: 'bold', 
            color: themeColor,
            marginBottom: '12px',
            borderBottom: `1px solid ${themeColor}`,
            paddingBottom: '6px',
          }}>
            {section?.title || `Section ${sectionIndex + 1}`}
          </h2>
          
          <div style={{ paddingLeft: '10px' }}>
            {content}
          </div>

          {/* Add doctor profile image at end of Section 10 */}
          {isLastSection && sectionIndex === sections.length - 1 && renderDoctorProfile()}
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
      const isLastSection = sectionIndex === sections.length - 1;
      if (section.items.length > 0 || isLastSection) {
        pages.push(
          renderContentPage(
            sectionIndex,
            pageNumber,
            renderSectionContent(section, sectionIndex),
            isLastSection
          )
        );
        pageNumber++;
      }
    });

    return pages;
  };

  // Helper to render the appropriate cover page
  const renderCoverPage = () => {
    if (isStanleyGraves) return renderStanleyGravesCoverPage();
    if (isLCA) return renderLCACoverPage();
    return renderLCPCoverPage();
  };

  return (
    <div id="template-preview-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Cover Page */}
      {renderCoverPage()}

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
