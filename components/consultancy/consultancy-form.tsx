"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FormField } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConsultancyForm } from "@/hooks/use-consultancy";
import { ConsultancyStep } from "@/services/consultancy-service";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import { TagInput } from "@/components/ui/tag-input";

interface FormField {
  id: string;
  type: "text" | "email" | "tel" | "textarea" | "checkbox" | "radio" | "select";
  label: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  title?: string;
  fields: FormField[];
}

interface FormStep {
  id: string;
  title: string;
  description: string;
  forms: Form[];
}

// Add this type
type InputType = "text" | "email" | "tel";

export function ConsultancyForm() {
  const { steps, isLoading, updateStep } = useConsultancyForm();
  const [localSteps, setLocalSteps] = useState<ConsultancyStep[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize local state when steps are loaded
  useEffect(() => {
    if (steps) {
      setLocalSteps(steps);
    }
  }, [steps]);

  const handleStepUpdate = (
    stepId: string,
    updates: Partial<ConsultancyStep>
  ) => {
    setLocalSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId ? { ...step, ...updates } : step
      )
    );
  };

  const handleSaveAll = async () => {
    try {
      setIsSaving(true);
      // Save all modified steps
      await Promise.all(
        localSteps.map((step) => updateStep({ id: step.id, updates: step }))
      );
      toast.success("All steps saved successfully");
    } catch (error) {
      console.error("Error saving steps:", error);
      toast.error("Failed to save steps");
    } finally {
      setIsSaving(false);
    }
  };

  const renderStepFields = (step: ConsultancyStep) => {
    const fields = step.fields || {};

    switch (step.step_number) {
      case 1:
        return (
          <div className="space-y-4">
            {fields.inputs?.map((input: any, index: number) => (
              <div key={index} className="flex gap-4 items-center">
                <Input
                  placeholder="Input Label"
                  value={input.label || ""}
                  onChange={(e) => {
                    const newInputs = [...(fields.inputs || [])];
                    newInputs[index] = {
                      ...input,
                      label: e.target.value,
                    };
                    handleStepUpdate(step.id, {
                      fields: { ...fields, inputs: newInputs },
                    });
                  }}
                  className="flex-1"
                />
                <Select
                  value={input.type || "text"}
                  onValueChange={(value: InputType) => {
                    const newInputs = [...(fields.inputs || [])];
                    newInputs[index] = {
                      ...input,
                      type: value,
                    };
                    handleStepUpdate(step.id, {
                      fields: { ...fields, inputs: newInputs },
                    });
                  }}
                >
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="tel">Phone</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newInputs = fields.inputs.filter(
                      (_, i) => i !== index
                    );
                    handleStepUpdate(step.id, {
                      fields: { ...fields, inputs: newInputs },
                    });
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              onClick={() => {
                const newInputs = [
                  ...(fields.inputs || []),
                  {
                    label: "",
                    type: "text", // default type
                  },
                ];
                handleStepUpdate(step.id, {
                  fields: { ...fields, inputs: newInputs },
                });
              }}
              variant="outline"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Input Field
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Radio Group 1 */}
            <div className="space-y-4">
              <Label>Radio Group 1</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <Input
                    placeholder="Radio Group 1 Label"
                    value={fields.radio_group1?.label || ""}
                    onChange={(e) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group1: {
                            ...fields.radio_group1,
                            label: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Options
                    </Label>
                    <TagInput
                      placeholder="Type an option and press Enter..."
                      tags={fields.radio_group1?.options || []}
                      setTags={(newTags) =>
                        handleStepUpdate(step.id, {
                          fields: {
                            ...fields,
                            radio_group1: {
                              ...fields.radio_group1,
                              options: newTags,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Radio Group 2 */}
            <div className="space-y-4">
              <Label>Radio Group 2</Label>
              <div className="flex gap-4 items-start">
                <div className="flex-1 space-y-4">
                  <Input
                    placeholder="Radio Group 2 Label"
                    value={fields.radio_group2?.label || ""}
                    onChange={(e) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group2: {
                            ...fields.radio_group2,
                            label: e.target.value,
                          },
                        },
                      })
                    }
                  />
                  <div className="space-y-2">
                    <Label className="text-sm text-muted-foreground">
                      Options
                    </Label>
                    <TagInput
                      placeholder="Type an option and press Enter..."
                      tags={fields.radio_group2?.options || []}
                      setTags={(newTags) =>
                        handleStepUpdate(step.id, {
                          fields: {
                            ...fields,
                            radio_group2: {
                              ...fields.radio_group2,
                              options: newTags,
                            },
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4">
              <Input
                placeholder="Textarea Label"
                value={fields.textarea?.label || ""}
                onChange={(e) =>
                  handleStepUpdate(step.id, {
                    fields: {
                      ...fields,
                      textarea: {
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            {/* Checkbox */}
            <div className="space-y-4">
              <Label>Checkbox</Label>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Checkbox Label"
                  value={fields.checkbox?.label || ""}
                  onChange={(e) =>
                    handleStepUpdate(step.id, {
                      fields: {
                        ...fields,
                        checkbox: {
                          ...fields.checkbox,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Options
                  </Label>
                  <TagInput
                    placeholder="Type an option and press Enter..."
                    tags={fields.checkbox?.options || []}
                    setTags={(newTags) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          checkbox: {
                            ...fields.checkbox,
                            options: newTags,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Textarea */}
            <div className="space-y-4">
              <Input
                placeholder="Textarea Label"
                value={fields.textarea?.label || ""}
                onChange={(e) =>
                  handleStepUpdate(step.id, {
                    fields: {
                      ...fields,
                      textarea: {
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            {/* Radio Group 1 */}
            <div className="space-y-4">
              <Label>Radio Group 1</Label>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Radio Group 1 Label"
                  value={fields.radio_group1?.label || ""}
                  onChange={(e) =>
                    handleStepUpdate(step.id, {
                      fields: {
                        ...fields,
                        radio_group1: {
                          ...fields.radio_group1,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Options
                  </Label>
                  <TagInput
                    placeholder="Type an option and press Enter..."
                    tags={fields.radio_group1?.options || []}
                    setTags={(newTags) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group1: {
                            ...fields.radio_group1,
                            options: newTags,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Radio Group 2 */}
            <div className="space-y-4">
              <Label>Radio Group 2</Label>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Radio Group 2 Label"
                  value={fields.radio_group2?.label || ""}
                  onChange={(e) =>
                    handleStepUpdate(step.id, {
                      fields: {
                        ...fields,
                        radio_group2: {
                          ...fields.radio_group2,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Options
                  </Label>
                  <TagInput
                    placeholder="Type an option and press Enter..."
                    tags={fields.radio_group2?.options || []}
                    setTags={(newTags) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group2: {
                            ...fields.radio_group2,
                            options: newTags,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Radio Group 1 */}
            <div className="space-y-4">
              <Label>Radio Group 1</Label>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Radio Group 1 Label"
                  value={fields.radio_group1?.label || ""}
                  onChange={(e) =>
                    handleStepUpdate(step.id, {
                      fields: {
                        ...fields,
                        radio_group1: {
                          ...fields.radio_group1,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Options
                  </Label>
                  <TagInput
                    placeholder="Type an option and press Enter..."
                    tags={fields.radio_group1?.options || []}
                    setTags={(newTags) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group1: {
                            ...fields.radio_group1,
                            options: newTags,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Radio Group 2 */}
            <div className="space-y-4">
              <Label>Radio Group 2</Label>
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Radio Group 2 Label"
                  value={fields.radio_group2?.label || ""}
                  onChange={(e) =>
                    handleStepUpdate(step.id, {
                      fields: {
                        ...fields,
                        radio_group2: {
                          ...fields.radio_group2,
                          label: e.target.value,
                        },
                      },
                    })
                  }
                />
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">
                    Options
                  </Label>
                  <TagInput
                    placeholder="Type an option and press Enter..."
                    tags={fields.radio_group2?.options || []}
                    setTags={(newTags) =>
                      handleStepUpdate(step.id, {
                        fields: {
                          ...fields,
                          radio_group2: {
                            ...fields.radio_group2,
                            options: newTags,
                          },
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>

            {/* Textarea 1 */}
            <div className="space-y-4">
              <Input
                placeholder="Textarea 1 Label"
                value={fields.textarea1?.label || ""}
                onChange={(e) =>
                  handleStepUpdate(step.id, {
                    fields: {
                      ...fields,
                      textarea1: {
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1"
              />
            </div>

            {/* Textarea 2 */}
            <div className="space-y-4">
              <Input
                placeholder="Textarea 2 Label"
                value={fields.textarea2?.label || ""}
                onChange={(e) =>
                  handleStepUpdate(step.id, {
                    fields: {
                      ...fields,
                      textarea2: {
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="flex gap-4 items-center">
              <Input
                placeholder="Textarea Label"
                value={fields.textarea?.label || ""}
                onChange={(e) =>
                  handleStepUpdate(step.id, {
                    fields: {
                      ...fields,
                      textarea: {
                        label: e.target.value,
                      },
                    },
                  })
                }
                className="flex-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card className="border-dashed">
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
              <p className="mt-2 text-muted-foreground">Loading form data...</p>
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
          <h2 className="text-lg font-medium">Consultancy Form Steps</h2>
          <p className="text-sm text-muted-foreground">
            Configure the consultancy form steps
          </p>
        </div>
        <Button onClick={handleSaveAll} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save All Changes"
          )}
        </Button>
      </div>

      {localSteps.map((step) => (
        <Card key={step.id} className="relative border-dashed">
          <div className="absolute -left-2 -top-2 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
            {step.step_number}
          </div>

          <CardHeader className="pt-6">
            <div className="space-y-2">
              <Input
                placeholder="Step Title"
                value={step.title}
                onChange={(e) =>
                  handleStepUpdate(step.id, { title: e.target.value })
                }
                className="text-lg font-medium"
              />
              <Textarea
                placeholder="Step Description"
                value={step.description}
                onChange={(e) =>
                  handleStepUpdate(step.id, { description: e.target.value })
                }
                className="resize-none"
              />
            </div>
          </CardHeader>

          <CardContent>{renderStepFields(step)}</CardContent>
        </Card>
      ))}
    </div>
  );
}
