import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { generateContactTemplate, generateConsultancyTemplate } from "@/helpers";
import { Lead } from "@/hooks/use-leads";

interface LeadDataDialogProps {
  lead: Lead | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadDataDialog({
  lead,
  open,
  onOpenChange,
}: LeadDataDialogProps) {
  if (!lead) return null;

  const getFormContent = () => {
    if (!lead.content) return "No data available";

    if (lead.form_type === "contact") {
      return generateContactTemplate(JSON.parse(lead.content));
    } else if (lead.form_type === "consultant") {
      return generateConsultancyTemplate(JSON.parse(lead.content));
    }

    return "Unknown form type";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Form Submission Details</DialogTitle>
        </DialogHeader>
        <div 
          className="mt-4"
          dangerouslySetInnerHTML={{ __html: getFormContent() }} 
        />
      </DialogContent>
    </Dialog>
  );
} 