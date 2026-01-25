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
import { getDavidTemplateSections, getDefaultSections } from "@/utils/davidTemplateData";
import { Save, Wand2, FileDown, FileText, Mail } from "lucide-react";

const Index = () => {
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [generatedTemplate, setGeneratedTemplate] = useState<TemplateInfo | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [activeSection, setActiveSection] = useState(0);

  // Initialize sections when template changes
  useEffect(() => {
    if (selectedTemplateId === "david-gupte-lcp") {
      setSections(getDavidTemplateSections());
    } else if (selectedTemplateId) {
      const template = TEMPLATES.find(t => t.id === selectedTemplateId);
      if (template) {
        setSections(getDefaultSections(template.type));
      }
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
      const exportData: ExportData = {
        template: generatedTemplate.name,
        patientName: getPatientName(),
        textItems: sections.flatMap(s => s.items.filter(i => i.text).map(i => ({ 
          type: "paragraph" as const, 
          content: i.text!.content 
        }))),
        tableData: { rows: sections.flatMap(s => s.items.filter(i => i.tableData).flatMap(i => i.tableData!.rows)) },
        mixedItems: [],
      };
      await exportToWord(exportData, `${generatedTemplate.name}_Report`);
      toast({ title: "Word Exported", description: "Downloaded successfully." });
    } catch (error) {
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

  return (
    <div className="min-h-screen bg-background">
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
              <Button onClick={handleGenerate}><Wand2 className="h-4 w-4 mr-2" />Generate</Button>
              <Button onClick={handleExportPDF} variant="outline" disabled={!generatedTemplate}><FileDown className="h-4 w-4 mr-2" />PDF</Button>
              <Button onClick={handleExportWord} variant="outline" disabled={!generatedTemplate}><FileText className="h-4 w-4 mr-2" />Word</Button>
              <Button onClick={handleExportEmail} variant="outline" disabled={!generatedTemplate}><Mail className="h-4 w-4 mr-2" />Email</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <SectionEditor 
              sections={sections} 
              onChange={setSections} 
              activeSection={activeSection}
              onActiveSectionChange={setActiveSection}
              templateType={generatedTemplate?.type}
            />
            <div className="flex justify-center pt-4">
              <Button onClick={handleSave} variant="outline" size="lg"><Save className="h-5 w-5 mr-2" />Save Content</Button>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 lg:self-start overflow-auto max-h-[calc(100vh-120px)]">
            <h2 className="text-lg font-semibold text-foreground mb-4">Template Preview</h2>
            <TemplatePreviewNew
              template={generatedTemplate}
              sections={sections}
              onSectionChange={handleSectionChange}
              onTableCellChange={handleTableCellChange}
              activeSection={activeSection}
              patientName={getPatientName()}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
