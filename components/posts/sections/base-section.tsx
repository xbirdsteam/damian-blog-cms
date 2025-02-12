import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Section } from "@/types/editor";
import { X } from "lucide-react";

interface BaseSectionProps {
  section: Section;
  title: string;
  onDelete: (id: string) => void;
  children: React.ReactNode;
}

export function BaseSection({
  section,
  title,
  onDelete,
  children,
}: BaseSectionProps) {
  return (
    <Card id={section.id}>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <h4 className="font-medium">{title}</h4>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(section.id)}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
