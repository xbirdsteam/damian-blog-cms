import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TestimonialSection as TestimonialSectionType } from "@/types/editor";
import { BaseSection } from "./base-section";

interface TestimonialSectionProps {
  section: TestimonialSectionType;
  onUpdate: (id: string, updates: Partial<TestimonialSectionType>) => void;
  onDelete: (id: string) => void;
}

export function TestimonialSection({
  section,
  onUpdate,
  onDelete,
}: TestimonialSectionProps) {
  return (
    <BaseSection
      section={section}
      title="Testimonial Section"
      onDelete={onDelete}
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Content</Label>
          <Textarea
            value={section.content}
            onChange={(e) => onUpdate(section.id, { content: e.target.value })}
            placeholder="Enter the testimonial content..."
            className="min-h-[100px]"
          />
        </div>

        <div className="space-y-2">
          <Label>Author Name</Label>
          <Input
            value={section.author}
            onChange={(e) => onUpdate(section.id, { author: e.target.value })}
            placeholder="Enter the author's name..."
          />
        </div>
      </div>
    </BaseSection>
  );
}
