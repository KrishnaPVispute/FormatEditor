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
import TemplatePreview from "@/components/TemplatePreview";
import { Save, Wand2 } from "lucide-react";

const Index = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<"LCA" | "LCP" | "">("");
  const [generatedTemplate, setGeneratedTemplate] = useState<"LCA" | "LCP" | null>(null);

  // Section 1: Text only
  const [textItems, setTextItems] = useState<TextItem[]>([]);

  // Section 2: Table only
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
    if (!selectedTemplate) {
      toast({
        title: "No Template Selected",
        description: "Please select a template (LCA or LCP) from the dropdown.",
        variant: "destructive",
      });
      return;
    }

    setGeneratedTemplate(selectedTemplate as "LCA" | "LCP");

    toast({
      title: "Template Generated",
      description: `Your content has been applied to the ${selectedTemplate} template.`,
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <h1 className="text-2xl font-bold text-foreground">Format Editor</h1>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select
                value={selectedTemplate}
                onValueChange={(value) => setSelectedTemplate(value as "LCA" | "LCP" | "")}
              >
                <SelectTrigger className="w-[180px] bg-background">
                  <SelectValue placeholder="Select Template" />
                </SelectTrigger>
                <SelectContent className="bg-popover z-50">
                  <SelectItem value="LCA">LCA</SelectItem>
                  <SelectItem value="LCP">LCP</SelectItem>
                </SelectContent>
              </Select>

              <Button onClick={handleGenerate} className="flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                Generate
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
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-lg font-semibold text-foreground mb-4">Template Preview</h2>
            <TemplatePreview
              template={generatedTemplate}
              textItems={textItems}
              tableData={tableData}
              mixedItems={mixedItems}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
