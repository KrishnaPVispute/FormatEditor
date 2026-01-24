import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import TextSection, { TextItem } from "@/components/TextSection";
import TableSection, { TableData } from "@/components/TableSection";
import MixedSection, { MixedItem } from "@/components/MixedSection";
import TemplatePreview, { TEMPLATES, TemplateInfo } from "@/components/TemplatePreview";
import { exportToPDF, exportToWord, ExportData } from "@/utils/exportUtils";
import { Save, Wand2, FileDown, FileText, Mail } from "lucide-react";

const Index = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedTemplate, setGeneratedTemplate] = useState<TemplateInfo | null>(null);

  // Section 1: Text only
  const [textItems, setTextItems] = useState<TextItem[]>([]);

  // Section 2: Table only (with optional header)
  const [tableData, setTableData] = useState<TableData>({ rows: [] });

  // Section 3: Mixed content
  const [mixedItems, setMixedItems] = useState<MixedItem[]>([]);

  const handleSave = () => {
    const savedData = {
      section1: textItems,
      section2: tableData,
      section3: mixedItems,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem("formatEditorData", JSON.stringify(savedData));

    toast({
      title: "Content Saved",
      description: "All sections have been saved successfully.",
    });
  };

  const handleGenerate = () => {
    if (!selectedTemplateId) {
      toast({
        title: "No Template Selected",
        description: "Please select a template from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      setGeneratedTemplate(template);
      toast({
        title: "Template Generated",
        description: `Your content has been applied to the ${template.name} template.`,
      });
    }
  };

  const getPatientName = () => {
    const nameItem = textItems.find(item => 
      item.content.toLowerCase().includes('patient') || 
      item.content.toLowerCase().includes('claimant') ||
      item.content.toLowerCase().includes('mr.') ||
      item.content.toLowerCase().includes('ms.')
    );
    return nameItem?.content || "Mr. John Doe";
  };

  const handleExportPDF = async () => {
    if (!generatedTemplate) {
      toast({
        title: "No Template Generated",
        description: "Please generate a template first before exporting.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exporting PDF",
      description: "Your PDF is being generated...",
    });

    try {
      await exportToPDF('template-preview-content', `${generatedTemplate.name}_Report`);
      toast({
        title: "PDF Exported",
        description: "Your PDF has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportWord = async () => {
    if (!generatedTemplate) {
      toast({
        title: "No Template Generated",
        description: "Please generate a template first before exporting.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Exporting Word",
      description: "Your Word document is being generated...",
    });

    try {
      const exportData: ExportData = {
        template: generatedTemplate.name,
        patientName: getPatientName(),
        textItems: textItems.map(item => ({ type: item.type, content: item.content })),
        tableData: tableData,
        mixedItems: mixedItems.map(item => ({ 
          type: item.type, 
          content: item.content,
          tableData: item.tableData,
        })),
      };

      await exportToWord(exportData, `${generatedTemplate.name}_Report`);
      toast({
        title: "Word Exported",
        description: "Your Word document has been downloaded successfully.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting the Word document.",
        variant: "destructive",
      });
    }
  };

  const handleExportEmail = async () => {
    if (!generatedTemplate) {
      toast({
        title: "No Template Generated",
        description: "Please generate a template first before exporting.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Opening Gmail",
      description: "Your email client will open. Please attach the PDF manually after downloading.",
    });

    try {
      // First generate the PDF
      await exportToPDF('template-preview-content', `${generatedTemplate.name}_Report`);
      
      // Open Gmail compose with pre-filled subject and body
      const subject = encodeURIComponent(`${generatedTemplate.name} Report - ${getPatientName()}`);
      const body = encodeURIComponent(
        `Please find attached the ${generatedTemplate.type === 'LCA' ? 'Life Care Analysis' : 'Life Care Plan'} report for ${getPatientName()}.\n\nBest regards`
      );
      
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
      
      toast({
        title: "PDF Downloaded",
        description: "Please attach the downloaded PDF to your email.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error preparing the email.",
        variant: "destructive",
      });
    }
  };

  // Handlers for editable preview
  const handleTextItemChange = (id: string, content: string) => {
    setTextItems(items => items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const handleTableCellChange = (rowIndex: number, colIndex: number, value: string) => {
    const newRows = tableData.rows.map((row, ri) =>
      ri === rowIndex
        ? row.map((cell, ci) => (ci === colIndex ? value : cell))
        : row
    );
    setTableData({ ...tableData, rows: newRows });
  };

  const handleMixedItemChange = (id: string, content: string) => {
    setMixedItems(items => items.map(item => 
      item.id === id ? { ...item, content } : item
    ));
  };

  const handleMixedTableCellChange = (id: string, rowIndex: number, colIndex: number, value: string) => {
    setMixedItems(items => items.map(item => {
      if (item.id === id && item.tableData) {
        const newRows = item.tableData.rows.map((row, ri) =>
          ri === rowIndex
            ? row.map((cell, ci) => (ci === colIndex ? value : cell))
            : row
        );
        return { ...item, tableData: { rows: newRows } };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Format Editor</h1>

            <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
              <Select
                value={selectedTemplateId}
                onValueChange={setSelectedTemplateId}
              >
                <SelectTrigger className="w-[220px] bg-background">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button onClick={handleGenerate} className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate
              </Button>

              <Button 
                onClick={handleExportPDF} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!generatedTemplate}
              >
                <FileDown className="h-4 w-4" />
                PDF
              </Button>

              <Button 
                onClick={handleExportWord} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!generatedTemplate}
              >
                <FileText className="h-4 w-4" />
                Word
              </Button>

              <Button 
                onClick={handleExportEmail} 
                variant="outline" 
                className="flex items-center gap-2"
                disabled={!generatedTemplate}
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Editor Column */}
          <div className="space-y-6">
            <TextSection items={textItems} onChange={setTextItems} />
            <TableSection data={tableData} onChange={setTableData} />
            <MixedSection items={mixedItems} onChange={setMixedItems} />

            {/* Save Button */}
            <div className="flex justify-center pt-4">
              <Button
                onClick={handleSave}
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-8"
              >
                <Save className="h-5 w-5" />
                Save Content
              </Button>
            </div>
          </div>

          {/* Preview Column */}
          <div className="lg:sticky lg:top-24 lg:self-start overflow-auto max-h-[calc(100vh-120px)]">
            <h2 className="text-lg font-semibold text-foreground mb-4">Template Preview</h2>
            <TemplatePreview
              template={generatedTemplate}
              textItems={textItems}
              tableData={tableData}
              mixedItems={mixedItems}
              onTextItemChange={handleTextItemChange}
              onTableCellChange={handleTableCellChange}
              onMixedItemChange={handleMixedItemChange}
              onMixedTableCellChange={handleMixedTableCellChange}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
