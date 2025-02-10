"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useConsultancySuccess } from "@/hooks/use-consultancy";
import { GripVertical, Loader2, Plus, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface SuccessStep {
  id: string;
  title: string;
  description: string | null;
  order_index: number;
}

export function ConsultancySuccess() {
  const { steps: savedSteps, isLoading, updateSteps } = useConsultancySuccess();
  const [steps, setSteps] = useState<SuccessStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (savedSteps) {
      setSteps(savedSteps);
    }
  }, [savedSteps]);

  const addStep = () => {
    const newStep: SuccessStep = {
      id: uuidv4(),
      title: "",
      description: "",
      order_index: steps.length,
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<SuccessStep>) => {
    setSteps(
      steps.map((step) => (step.id === stepId ? { ...step, ...updates } : step))
    );
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter((step) => step.id !== stepId));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await updateSteps(steps);
      toast.success("Success steps saved successfully");
    } catch (error) {
      console.error("Error saving success steps:", error);
      toast.error("Failed to save success steps");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">
                Loading success steps...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium">Success Steps</h2>
          <p className="text-sm text-muted-foreground">
            Define the steps shown after form submission
          </p>
        </div>
        <Button onClick={addStep} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Step
        </Button>
      </div>

      {steps.map((step, stepIndex) => (
        <Card key={step.id} className="relative border-dashed">
          {/* Step Number Badge */}
          <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {stepIndex + 1}
          </div>

          <CardHeader className="flex flex-row items-start justify-between pt-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-4">
                <GripVertical className="h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Step Title"
                  value={step.title}
                  onChange={(e) =>
                    updateStep(step.id, { title: e.target.value })
                  }
                  className="text-lg font-medium"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeStep(step.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Textarea
                placeholder="Step Description"
                value={step.description || ""}
                onChange={(e) =>
                  updateStep(step.id, { description: e.target.value })
                }
                className="resize-none min-h-[100px]"
              />
            </div>
          </CardHeader>
        </Card>
      ))}

      {steps.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              <p>No success steps created yet</p>
              <p className="text-sm">
                Click &quot;Add Step&quot; to get started
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Steps"
          )}
        </Button>
      </div>
    </div>
  );
}
