import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockquoteSection as BlockquoteSectionType } from "@/types/editor";
import { BaseSection } from "./base-section";

interface BlockquoteSectionProps {
  section: BlockquoteSectionType;
  onUpdate: (id: string, updates: Partial<BlockquoteSectionType>) => void;
  onDelete: (id: string) => void;
}

export function BlockquoteSection({
  section,
  onUpdate,
  onDelete,
}: BlockquoteSectionProps) {
  return (
    <BaseSection
      section={section}
      title="Blockquote Section"
      onDelete={onDelete}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Type</Label>
          <Input
            value={section.author || ""}
            onChange={(e) => onUpdate(section.id, { author: e.target.value })}
            placeholder="Enter quote type..."
          />
        </div>
        <div className="space-y-2">
          <Label>Quote</Label>
          <Textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            placeholder="Enter the quote text..."
            className="min-h-[100px]"
          />
        </div>
      </div>
    </BaseSection>
  );
}
