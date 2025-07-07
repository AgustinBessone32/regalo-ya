import { useState, type ReactNode } from "react";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Step {
  title: string;
  description: string;
  content: ReactNode;
  validation?: () => { isValid: boolean; errors: string[] };
}

interface WizardFormProps {
  steps: Step[];
  onComplete: () => void;
  isSubmitting?: boolean;
}

export function WizardForm({
  steps,
  onComplete,
  isSubmitting,
}: WizardFormProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { toast } = useToast();

  const handleNext = () => {
    // Validar el paso actual si tiene validación
    const currentStepData = steps[currentStep];
    if (currentStepData.validation) {
      const validation = currentStepData.validation();
      if (!validation.isValid) {
        toast({
          variant: "destructive",
          title: "Error de validación",
          description: validation.errors.join("\n"),
        });
        return;
      }
    }

    if (currentStep === steps.length - 1) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => prev - 1);
  };

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Pasos del Progreso */}
      <div className="relative">
        <div className="absolute left-0 top-[15px] w-full h-[2px] bg-muted" />
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center gap-1 md:gap-2"
            >
              <div
                className={cn(
                  "relative z-10 flex items-center justify-center w-7 h-7 md:w-8 md:h-8 rounded-full border text-xs md:text-sm font-medium",
                  index < currentStep
                    ? "bg-primary text-primary-foreground border-primary"
                    : index === currentStep
                    ? "bg-background border-primary text-primary"
                    : "bg-background border-muted-foreground text-muted-foreground"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-3 w-3 md:h-4 md:w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <span className="text-xs md:text-sm font-medium text-center max-w-[60px] md:max-w-none leading-tight">
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido del Paso */}
      <div className="min-h-[250px] md:min-h-[300px]">
        <div className="mb-4 md:mb-6">
          <h3 className="text-base md:text-lg font-semibold">
            {steps[currentStep].title}
          </h3>
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {steps[currentStep].description}
          </p>
        </div>
        <div className="px-1 md:px-0">{steps[currentStep].content}</div>
      </div>

      {/* Navegación */}
      <div className="flex flex-col-reverse gap-3 md:flex-row md:justify-between md:gap-0">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
          className="w-full md:w-auto"
        >
          Atrás
        </Button>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="w-full md:w-auto"
        >
          {isSubmitting ? (
            "Creando..."
          ) : currentStep === steps.length - 1 ? (
            "Crear Proyecto"
          ) : (
            <>
              Siguiente
              <ChevronRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
