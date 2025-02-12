import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TextSection as TextSectionType } from "@/types/editor";
import { Plus, Trash } from "lucide-react";
import { BaseSection } from "./base-section";

interface TextSectionProps {
  section: TextSectionType;
  onUpdate: (id: string, updates: Partial<TextSectionType>) => void;
  onDelete: (id: string) => void;
}

export function TextSection({ section, onUpdate, onDelete }: TextSectionProps) {
  const addParagraph = () => {
    const paragraphs = section.paragraphs || [];
    onUpdate(section.id, {
      paragraphs: [...paragraphs, ""],
    });
  };

  const updateParagraph = (index: number, content: string) => {
    const paragraphs = [...(section.paragraphs || [])];
    paragraphs[index] = content;
    onUpdate(section.id, { paragraphs });
  };

  const removeParagraph = (index: number) => {
    const paragraphs = [...(section.paragraphs || [])];
    paragraphs.splice(index, 1);
    onUpdate(section.id, { paragraphs });
  };

  return (
    <BaseSection section={section} title="Text Section" onDelete={onDelete}>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={section.title || ""}
            onChange={(e) => onUpdate(section.id, { title: e.target.value })}
            placeholder="Enter section title..."
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Paragraphs</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParagraph}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Paragraph
            </Button>
          </div>

          {(section.paragraphs || []).map((paragraph, index) => (
            <div key={index} className="flex gap-2">
              <Textarea
                value={paragraph}
                onChange={(e) => updateParagraph(index, e.target.value)}
                placeholder={`Enter paragraph ${index + 1}...`}
                className="min-h-[100px]"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeParagraph(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </BaseSection>
  );
}
