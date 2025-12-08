import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, GripVertical } from "lucide-react";

interface Service {
  name: string;
  duration?: number;
  description?: string;
}

interface ServicesEditorProps {
  value: Service[];
  onChange: (services: Service[]) => void;
}

export function ServicesEditor({ value, onChange }: ServicesEditorProps) {
  const services = value || [];

  const addService = () => {
    onChange([...services, { name: "", duration: 30 }]);
  };

  const updateService = (index: number, updates: Partial<Service>) => {
    const updated = [...services];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeService = (index: number) => {
    onChange(services.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-3">
      {services.length === 0 ? (
        <div className="text-center py-6 text-muted-foreground border border-dashed border-border rounded-lg">
          <p className="mb-2">No services configured</p>
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </div>
      ) : (
        <>
          {services.map((service, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background"
            >
              <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
              <div className="flex-1 grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Service Name</Label>
                  <Input
                    value={service.name}
                    onChange={(e) => updateService(index, { name: e.target.value })}
                    placeholder="e.g., Dental Checkup"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Duration (minutes)</Label>
                  <Input
                    type="number"
                    value={service.duration || ""}
                    onChange={(e) => updateService(index, { duration: parseInt(e.target.value) || 0 })}
                    placeholder="30"
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeService(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addService}>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </>
      )}
    </div>
  );
}
