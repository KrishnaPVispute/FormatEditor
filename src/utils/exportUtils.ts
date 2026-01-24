import { saveAs } from 'file-saver';
import { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, Packer } from 'docx';
import DOMPurify from 'dompurify';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export interface ExportData {
  template: string;
  patientName: string;
  textItems: Array<{ type: string; content: string }>;
  tableData: { header?: string; rows: string[][] };
  mixedItems: Array<{ type: string; content: string; tableData?: { rows: string[][] } }>;
}

// Export to PDF using jspdf + html2canvas with DOMPurify sanitization
export const exportToPDF = async (elementId: string, filename: string) => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error('Element not found for PDF export');
  }

  // Sanitize the HTML content before processing
  const sanitizedHTML = DOMPurify.sanitize(element.innerHTML, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ['script', 'object', 'embed', 'link', 'style'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover'],
  });
  
  // Create a temporary container with sanitized content
  const tempContainer = document.createElement('div');
  tempContainer.innerHTML = sanitizedHTML;
  tempContainer.style.position = 'absolute';
  tempContainer.style.left = '-9999px';
  tempContainer.style.top = '0';
  document.body.appendChild(tempContainer);

  try {
    // Capture the element as canvas
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Create PDF with A4 dimensions
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.98);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
    const imgX = (pdfWidth - imgWidth * ratio) / 2;
    const imgY = 0;

    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
    pdf.save(`${filename}.pdf`);
  } finally {
    // Clean up temporary container
    document.body.removeChild(tempContainer);
  }
};

// Export to Word document
export const exportToWord = async (data: ExportData, filename: string) => {
  const isLCA = data.template.includes('LCA');
  const headerColor = isLCA ? 'CC7900' : '2E74B5';
  
  const children: (Paragraph | Table)[] = [];

  // Title
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.template,
          bold: true,
          size: 48,
          color: headerColor,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Subtitle
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: isLCA ? 'LIFE CARE ANALYSIS' : 'LIFE CARE PLAN',
          bold: true,
          size: 36,
          color: headerColor,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  // Patient name
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `Prepared for ${data.patientName}`,
          size: 28,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Date
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
          size: 24,
          font: 'Times New Roman',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 600 },
    })
  );

  // Section 1: Text Content
  if (data.textItems.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: isLCA ? 'Life Care Analysis' : 'Overview',
            bold: true,
            size: 28,
            color: headerColor,
            font: 'Times New Roman',
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    data.textItems.forEach((item) => {
      if (item.type === 'heading') {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.content || '[Heading]',
                bold: true,
                size: 26,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );
      } else {
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
      }
    });
  }

  // Section 2: Table with optional header
  if (data.tableData.rows.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: data.tableData.header || (isLCA ? 'Total Expenditures' : 'Summary Cost Projection Tables'),
            bold: true,
            size: 28,
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
                    size: 20,
                    color: rowIndex === 0 ? 'FFFFFF' : '000000',
                    font: 'Times New Roman',
                  }),
                ],
                alignment: rowIndex === 0 ? AlignmentType.CENTER : AlignmentType.LEFT,
              }),
            ],
            shading: {
              fill: rowIndex === 0 ? headerColor : (rowIndex % 2 === 0 ? (isLCA ? 'FFF5E6' : 'E6F0FA') : 'FFFFFF'),
            },
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

  // Section 3: Mixed Content
  if (data.mixedItems.length > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: isLCA ? 'Detailed Analysis' : 'Future Medical Requirements',
            bold: true,
            size: 28,
            color: headerColor,
            font: 'Times New Roman',
          }),
        ],
        spacing: { before: 400, after: 200 },
      })
    );

    data.mixedItems.forEach((item) => {
      if (item.type === 'table' && item.tableData) {
        const tableRows = item.tableData.rows.map((row, rowIndex) =>
          new TableRow({
            children: row.map((cell) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cell || '-',
                        bold: rowIndex === 0,
                        size: 20,
                        color: rowIndex === 0 ? 'FFFFFF' : '000000',
                        font: 'Times New Roman',
                      }),
                    ],
                  }),
                ],
                shading: {
                  fill: rowIndex === 0 ? headerColor : (rowIndex % 2 === 0 ? (isLCA ? 'FFF5E6' : 'E6F0FA') : 'FFFFFF'),
                },
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
      } else {
        const isBold = item.type === 'heading';
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: item.content || '[Text]',
                bold: isBold,
                size: isBold ? 26 : 22,
                font: 'Times New Roman',
              }),
            ],
            spacing: { before: 100, after: 100 },
          })
        );
      }
    });
  }

  // Confidentiality notice
  children.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `This report is confidential and protected by attorney-client privilege. It is intended solely for the named recipient and contains information related to a ${isLCA ? 'Life Care Analysis (LCA)' : 'Life Care Plan (LCP)'}. Any unauthorized disclosure, copying, or distribution of this report is strictly prohibited.`,
          italics: true,
          size: 18,
          font: 'Times New Roman',
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
              width: 11906,
              height: 16838,
            },
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
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
