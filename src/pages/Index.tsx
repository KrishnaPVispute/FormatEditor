import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import SectionEditor, { Section, SectionItem } from "@/components/SectionEditor";
import TemplatePreviewNew, { TEMPLATES, TemplateInfo } from "@/components/TemplatePreviewNew";
import { exportToPDF, exportToWord, ExportData } from "@/utils/exportUtils";
import { getDefaultSectionData } from "@/utils/davidTemplateData";
import { Save, Wand2, FileDown, FileText, Mail, Eye, Edit } from "lucide-react";
import { cn } from "@/lib/utils";

type ViewMode = "editor" | "preview";

const Index = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedTemplate, setGeneratedTemplate] = useState<TemplateInfo | null>(null);
  const [sections, setSections] = useState<Section[]>(getDefaultSectionData());
  const [activeSection, setActiveSection] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>("editor");

  // When template changes, keep the same data but update styling
  useEffect(() => {
    if (!selectedTemplateId) return;
    
    // Data stays the same for all templates - only the theme/styling changes
    // User can edit or delete the default data
    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      setGeneratedTemplate(null); // Reset generated state so user needs to click Generate
    }
  }, [selectedTemplateId]);

  const handleSave = () => {
    const savedData = {
      sections,
      templateId: selectedTemplateId,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem("formatEditorData", JSON.stringify(savedData));
    toast({ title: "Content Saved", description: "All sections have been saved successfully." });
  };

  const handleGenerate = () => {
    if (!selectedTemplateId) {
      toast({ title: "No Template Selected", description: "Please select a template.", variant: "destructive" });
      return;
    }
    const template = TEMPLATES.find(t => t.id === selectedTemplateId);
    if (template) {
      setGeneratedTemplate(template);
      setViewMode("preview"); // Switch to preview after generating
      toast({ title: "Template Generated", description: `Applied to ${template.name} template.` });
    }
  };

  const getPatientName = () => {
    for (const section of sections) {
      for (const item of section.items) {
        if (item.text?.content) {
          const match = item.text.content.match(/(?:Mr\.|Ms\.|Mrs\.)\s+[\w\s]+/i);
          if (match) return match[0];
        }
      }
    }
    return "Mr. John Doe";
  };

  const handleExportPDF = async () => {
    if (!generatedTemplate) {
      toast({ title: "No Template Generated", description: "Please generate first.", variant: "destructive" });
      return;
    }
    toast({ title: "Exporting PDF", description: "Generating..." });
    try {
      await exportToPDF('template-preview-content', `${generatedTemplate.name}_Report`);
      toast({ title: "PDF Exported", description: "Downloaded successfully." });
    } catch (error) {
      toast({ title: "Export Failed", description: "Error exporting PDF.", variant: "destructive" });
    }
  };

  const handleExportWord = async () => {
    if (!generatedTemplate) {
      toast({ title: "No Template Generated", description: "Please generate first.", variant: "destructive" });
      return;
    }
    toast({ title: "Exporting Word", description: "Generating..." });
    try {
      // Convert sections to export format with full data
      const exportData: ExportData = {
        template: generatedTemplate.name,
        patientName: getPatientName(),
        textItems: [],
        tableData: { rows: [] },
        mixedItems: [],
        sections: sections.map(section => ({
          title: section.title,
          items: section.items.map(item => ({
            type: item.type,
            text: item.text ? {
              content: item.text.content,
              fontSize: item.text.fontSize,
              isBold: item.text.isBold,
              isItalic: item.text.isItalic,
              isUnderline: item.text.isUnderline,
              alignment: item.text.alignment,
            } : undefined,
            tableData: item.tableData ? {
              header: item.tableData.header,
              rows: item.tableData.rows,
            } : undefined,
          })),
        })),
      };
      await exportToWord(exportData, `${generatedTemplate.name}_Report`);
      toast({ title: "Word Exported", description: "Downloaded successfully." });
    } catch (error) {
      console.error('Word export error:', error);
      toast({ title: "Export Failed", description: "Error exporting Word.", variant: "destructive" });
    }
  };

  const handleExportEmail = async () => {
    if (!generatedTemplate) {
      toast({ title: "No Template Generated", description: "Please generate first.", variant: "destructive" });
      return;
    }
    toast({ title: "Opening Gmail", description: "Attach PDF manually after download." });
    try {
      await exportToPDF('template-preview-content', `${generatedTemplate.name}_Report`);
      const subject = encodeURIComponent(`${generatedTemplate.name} Report - ${getPatientName()}`);
      const body = encodeURIComponent(`Please find attached the ${generatedTemplate.type === 'LCA' ? 'Life Care Analysis' : 'Life Care Plan'} report.\n\nBest regards`);
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&su=${subject}&body=${body}`, '_blank');
    } catch (error) {
      toast({ title: "Export Failed", description: "Error preparing email.", variant: "destructive" });
    }
  };

  const handleSectionChange = (sectionIndex: number, itemIndex: number, updates: Partial<SectionItem>) => {
    setSections(prev => prev.map((section, si) => 
      si === sectionIndex 
        ? { ...section, items: section.items.map((item, ii) => ii === itemIndex ? { ...item, ...updates } : item) }
        : section
    ));
  };

  const handleTableCellChange = (sectionIndex: number, itemIndex: number, rowIndex: number, colIndex: number, value: string) => {
    setSections(prev => prev.map((section, si) => {
      if (si !== sectionIndex) return section;
      return {
        ...section,
        items: section.items.map((item, ii) => {
          if (ii !== itemIndex || !item.tableData) return item;
          const newRows = item.tableData.rows.map((row, ri) =>
            ri === rowIndex ? row.map((cell, ci) => ci === colIndex ? value : cell) : row
          );
          return { ...item, tableData: { ...item.tableData, rows: newRows } };
        })
      };
    }));
  };

  const templateType = generatedTemplate?.type || (selectedTemplateId ? TEMPLATES.find(t => t.id === selectedTemplateId)?.type : "LCP") || "LCP";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Format Editor</h1>
            <div className="flex items-center gap-3 flex-wrap">
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger className="w-[220px] bg-background">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  {TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={handleGenerate} disabled={!selectedTemplateId}>
                <Wand2 className="h-4 w-4 mr-2" />Generate
              </Button>
              <Button onClick={handleExportPDF} variant="outline" disabled={!generatedTemplate}>
                <FileDown className="h-4 w-4 mr-2" />PDF
              </Button>
              <Button onClick={handleExportWord} variant="outline" disabled={!generatedTemplate}>
                <FileText className="h-4 w-4 mr-2" />Word
              </Button>
              <Button onClick={handleExportEmail} variant="outline" disabled={!generatedTemplate}>
                <Mail className="h-4 w-4 mr-2" />Email
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Sticky Animated Toggle View Buttons */}
      <div className="bg-muted/95 backdrop-blur-sm border-b border-border sticky top-[73px] z-30 shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-4">
          <div className="relative bg-background rounded-full p-1 flex items-center shadow-inner border border-border">
            {/* Animated sliding background */}
            <div 
              className="absolute h-[calc(100%-8px)] w-[calc(50%-4px)] bg-primary rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] shadow-lg"
              style={{ 
                left: viewMode === "editor" ? "4px" : "calc(50% + 2px)",
              }}
            />
            
            {/* Editor Button */}
            <button
              onClick={() => setViewMode("editor")}
              className={cn(
                "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300",
                viewMode === "editor" 
                  ? "text-primary-foreground scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Edit className={cn("h-4 w-4 transition-transform duration-300", viewMode === "editor" && "rotate-12")} />
              Section Editor
            </button>
            
            {/* Preview Button */}
            <button
              onClick={() => setViewMode("preview")}
              className={cn(
                "relative z-10 flex items-center gap-2 px-6 py-2 rounded-full font-medium transition-all duration-300",
                viewMode === "preview" 
                  ? "text-primary-foreground scale-105" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Eye className={cn("h-4 w-4 transition-transform duration-300", viewMode === "preview" && "scale-110")} />
              Template Preview
            </button>
          </div>
          
          <Button onClick={handleSave} variant="ghost" size="sm" className="ml-4">
            <Save className="h-4 w-4 mr-2" />Save
          </Button>
        </div>
      </div>

      {/* Main Content - Full Width Single View */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {viewMode === "editor" ? (
          <div className="max-w-5xl mx-auto">
            <SectionEditor 
              sections={sections} 
              onChange={setSections} 
              activeSection={activeSection}
              onActiveSectionChange={(index) => {
                setActiveSection(index);
              }}
              templateType={templateType}
            />
          </div>
        ) : (
          <div className="overflow-x-auto flex justify-center">
            <TemplatePreviewNew
              template={generatedTemplate}
              sections={sections}
              onSectionChange={handleSectionChange}
              onTableCellChange={handleTableCellChange}
              activeSection={activeSection}
              patientName={getPatientName()}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
