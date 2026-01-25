import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Packer, BorderStyle, ImageRun, ITableCellBorders, HeightRule, convertInchesToTwip, PageBreak } from 'docx';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getDisplayValue } from './tableFormulas';
import neilGhodadraLogo from '@/assets/neil-ghodadra-logo.jpg';
import paulGhattasLogo from '@/assets/paul-ghattas-logo.png';

export interface FormattedTextExport {
  content: string;
  fontSize?: number;
  isBold?: boolean;
  isItalic?: boolean;
  isUnderline?: boolean;
  alignment?: 'left' | 'center' | 'right' | 'justify';
}

export interface SectionItemExport {
  type: 'text' | 'table';
  text?: FormattedTextExport;
  tableData?: {
    header?: string;
    rows: string[][];
  };
}

export interface SectionExport {
  title: string;
  items: SectionItemExport[];
}

export interface ExportData {
  template: string;
  patientName: string;
  textItems: Array<{ type: string; content: string }>;
  tableData: { header?: string; rows: string[][] };
  mixedItems: Array<{ type: string; content: string; tableData?: { rows: string[][] } }>;
  sections?: SectionExport[];
}

// A4 dimensions in pixels at 96 DPI
const A4_WIDTH_PX = 794;
const A4_HEIGHT_PX = 1123;

// Export to PDF - captures each page separately for proper multi-page output
export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  // Find all page elements within the preview
  const pages = element.querySelectorAll('[style*="width: 794px"]');
  
  if (pages.length === 0) {
    throw new Error('No pages found for PDF export');
  }

  // Create PDF with A4 dimensions
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i] as HTMLElement;
    
    // Clone the page for rendering
    const clonedPage = page.cloneNode(true) as HTMLElement;
    
    // Fix table alignment - ensure proper table cell styling
    const tables = clonedPage.querySelectorAll('table');
    tables.forEach((table) => {
      table.style.tableLayout = 'fixed';
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      
      const cells = table.querySelectorAll('td, th');
      cells.forEach((cell) => {
        const cellEl = cell as HTMLElement;
        cellEl.style.overflow = 'hidden';
        cellEl.style.textOverflow = 'ellipsis';
        cellEl.style.wordWrap = 'break-word';
        cellEl.style.verticalAlign = 'middle';
        cellEl.style.boxSizing = 'border-box';
      });
    });
    
    // Remove input elements and replace with their values for clean capture
    const inputs = clonedPage.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
      const el = input as HTMLInputElement | HTMLTextAreaElement;
      const parentCell = el.closest('td');
      const span = document.createElement('span');
      span.textContent = el.value || el.placeholder || '';
      
      // Copy computed styles but ensure proper containment
      const computedStyle = window.getComputedStyle(el);
      span.style.fontFamily = computedStyle.fontFamily;
      span.style.fontSize = computedStyle.fontSize;
      span.style.fontWeight = computedStyle.fontWeight;
      span.style.color = computedStyle.color;
      span.style.textAlign = computedStyle.textAlign;
      span.style.display = 'block';
      span.style.padding = '6px 8px';
      span.style.margin = '0';
      span.style.border = 'none';
      span.style.background = 'transparent';
      span.style.whiteSpace = 'pre-wrap';
      span.style.wordBreak = 'break-word';
      span.style.overflow = 'hidden';
      span.style.lineHeight = '1.4';
      
      // Ensure table cells contain text properly
      if (parentCell) {
        parentCell.style.padding = '0';
        parentCell.style.overflow = 'hidden';
      }
      
      el.parentNode?.replaceChild(span, el);
    });

    // Create temporary container
    const tempContainer = document.createElement('div');
    tempContainer.appendChild(clonedPage);
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = `${A4_WIDTH_PX}px`;
    document.body.appendChild(tempContainer);

    try {
      // Capture the page as canvas
      const canvas = await html2canvas(clonedPage, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: A4_WIDTH_PX,
        windowWidth: A4_WIDTH_PX,
      });

      // Add new page if not the first
      if (i > 0) {
        pdf.addPage();
      }

      // Add image to PDF, scaled to fit A4
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
    } finally {
      document.body.removeChild(tempContainer);
    }
  }

  pdf.save(`${filename}.pdf`);
};

// Helper to get alignment type for docx
const getAlignmentType = (alignment?: string): typeof AlignmentType[keyof typeof AlignmentType] => {
  switch (alignment) {
    case 'center': return AlignmentType.CENTER;
    case 'right': return AlignmentType.RIGHT;
    case 'justify': return AlignmentType.JUSTIFIED;
    default: return AlignmentType.LEFT;
  }
};

// Create table cell borders
const tableBorders: ITableCellBorders = {
  top: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  left: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
  right: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' },
};

// Helper function to fetch image as base64
const fetchImageAsBase64 = async (imageSrc: string): Promise<Uint8Array> => {
  try {
    const response = await fetch(imageSrc);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    return new Uint8Array(arrayBuffer);
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

// Export to Word document - matches the template preview exactly
export const exportToWord = async (data: ExportData, filename: string) => {
  const isLCA = data.template.includes('LCA');
  const headerColor = isLCA ? 'CC7900' : '2E74B5';
  const altRowColor = isLCA ? 'FFF5E6' : 'E6F0FA';
  const doctorName = isLCA ? 'NEIL GHODADRA, M.D.' : 'PAUL GHATTAS, D.O.';
  const reportType = isLCA ? 'Life Care Analysis' : 'Life Care Plan';
  const currentDate = new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
  
  const children: (Paragraph | Table)[] = [];

  // Fetch the logo image
  const logoSrc = isLCA ? neilGhodadraLogo : paulGhattasLogo;
  let logoImageData: Uint8Array | null = null;
  try {
    logoImageData = await fetchImageAsBase64(logoSrc);
  } catch (error) {
    console.warn('Could not load logo for Word export:', error);
  }

  // ============= COVER PAGE =============
  // Logo Image
  if (logoImageData) {
    children.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: logoImageData,
            transformation: {
              width: 150,
              height: 100,
            },
            type: isLCA ? 'jpg' : 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      })
    );
  }

  // Doctor Name / Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: doctorName,
          bold: true,
          size: 56, // 28pt
          color: '000000',
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: logoImageData ? 200 : 800, after: 200 },
    })
  );

  // Credentials
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isLCA ? 'Board-Certified Orthopedic Surgeon' : 'Board Certified Orthopedic Surgeon',
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  if (isLCA) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Certified Life Care Planner',
            size: 24,
            font: 'Times New Roman',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );
  }

  // Report Type
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: reportType.toUpperCase(),
          bold: true,
          size: 56,
          color: headerColor,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 300 },
    })
  );

  // Patient Name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Prepared for ',
          size: 28,
          font: 'Times New Roman',
        }),
        new TextRun({
          text: data.patientName,
          size: 32,
          color: '5B9BD5',
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: currentDate,
          bold: true,
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Confidentiality notice on cover
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a ${reportType}. Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { before: 1200 },
    })
  );

  // Page break after cover
  children.push(
    new Paragraph({
      children: [new PageBreak()],
    })
  );

  // ============= SECTION PAGES =============
  if (data.sections && data.sections.length > 0) {
    data.sections.forEach((section, sectionIndex) => {
      // Section Title
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.title,
              bold: true,
              size: 32, // 16pt
              color: headerColor,
              font: 'Times New Roman',
            }),
          ],
          spacing: { before: 200, after: 200 },
          border: {
            bottom: {
              color: headerColor,
              space: 1,
              style: BorderStyle.SINGLE,
              size: 6,
            },
          },
        })
      );

      // Section Items
      section.items.forEach((item) => {
        if (item.type === 'text' && item.text) {
          const text = item.text;
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: text.content || '',
                  bold: text.isBold || false,
                  italics: text.isItalic || false,
                  underline: text.isUnderline ? {} : undefined,
                  size: (text.fontSize || 11) * 2, // Convert to half-points
                  font: 'Times New Roman',
                }),
              ],
              alignment: getAlignmentType(text.alignment),
              spacing: { before: 100, after: 100 },
            })
          );
        } else if (item.type === 'table' && item.tableData) {
          // Table header if present
          if (item.tableData.header) {
            children.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: item.tableData.header,
                    bold: true,
                    size: 26, // 13pt
                    color: headerColor,
                    font: 'Times New Roman',
                  }),
                ],
                spacing: { before: 200, after: 100 },
              })
            );
          }

          // Table rows
          const tableRows = item.tableData.rows.map((row, rowIndex) =>
            new TableRow({
              children: row.map((cell) => {
                // Evaluate formulas for display
                const displayValue = getDisplayValue(cell, item.tableData!.rows);
                return new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: displayValue || '-',
                          bold: rowIndex === 0,
                          size: 22, // 11pt
                          color: rowIndex === 0 ? 'FFFFFF' : '000000',
                          font: 'Times New Roman',
                        }),
                      ],
                      alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                    }),
                  ],
                  shading: {
                    fill: rowIndex === 0 ? headerColor : (rowIndex % 2 === 0 ? altRowColor : 'FFFFFF'),
                  },
                  borders: tableBorders,
                });
              }),
              height: { value: 400, rule: HeightRule.ATLEAST },
            })
          );

          if (tableRows.length > 0) {
            children.push(
              new Table({
                rows: tableRows,
                width: { size: 100, type: WidthType.PERCENTAGE },
              })
            );
          }

          // Add spacing after table
          children.push(
            new Paragraph({
              children: [],
              spacing: { after: 200 },
            })
          );
        }
      });

      // Page break after each section (except the last)
      if (sectionIndex < data.sections!.length - 1) {
        children.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }
    });
  } else {
    // Fallback: Use legacy format if sections not provided
    // Section 1: Text Content
    if (data.textItems.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: isLCA ? 'Life Care Analysis' : 'Overview',
              bold: true,
              size: 32,
              color: headerColor,
              font: 'Times New Roman',
            }),
          ],
          spacing: { before: 200, after: 200 },
        })
      );

      data.textItems.forEach((item) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.content || '[Text]',
                size: 22,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );
      });
    }

    // Section 2: Table
    if (data.tableData.rows.length > 0) {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: data.tableData.header || 'Summary Table',
              bold: true,
              size: 32,
              color: headerColor,
              font: 'Times New Roman',
            }),
          ],
          spacing: { before: 400, after: 200 },
        })
      );

      const tableRows = data.tableData.rows.map((row, rowIndex) =>
        new TableRow({
          children: row.map((cell) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: cell || '-',
                      bold: rowIndex === 0,
                      size: 22,
                      color: rowIndex === 0 ? 'FFFFFF' : '000000',
                      font: 'Times New Roman',
                    }),
                  ],
                  alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
                }),
              ],
              shading: {
                fill: rowIndex === 0 ? headerColor : (rowIndex % 2 === 0 ? altRowColor : 'FFFFFF'),
              },
              borders: tableBorders,
            })
          ),
        })
      );

      children.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
    }
  }

  // Final confidentiality notice
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a ${reportType}. Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
          color: '666666',
        }),
      ],
      spacing: { before: 600 },
    })
  );

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips
              height: 16838, // A4 height in twips
            },
            margin: {
              top: 1134, // ~0.79 inch
              right: 1134,
              bottom: 1134,
              left: 1134,
            },
          },
        },
        children,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
};
