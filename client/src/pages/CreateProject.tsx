import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { WizardForm } from "@/components/WizardForm";
import { useUser } from "@/hooks/use-user";
import { UploadButton } from "@/components/ui/upload-button";
import { Loader2 } from "lucide-react";

const projectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  image_url: z.string().optional(),
  target_amount: z.coerce.number().min(1, "El monto objetivo debe ser mayor a 0"),
  location: z.string().optional(),
  event_date: z.string().optional(),
  is_public: z.boolean().default(false),
  payment_method: z.enum(["cbu", "efectivo"]),
  payment_details: z.string().min(1, "Debes proporcionar los detalles del pago"),
});

type ImageUploadState = {
  isUploading: boolean;
  preview: string | null;
};

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [imageUpload, setImageUpload] = useState<ImageUploadState>({
    isUploading: false,
    preview: null,
  });

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      target_amount: 0,
      location: "",
      event_date: "",
      is_public: false,
      payment_method: undefined,
      payment_details: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Error al crear el proyecto");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "¡Éxito!",
        description: "Proyecto creado correctamente",
      });
      setLocation(`/projects/${data.id}`);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    const values = form.getValues();
    const result = projectSchema.safeParse({
      ...values,
      target_amount: Number(values.target_amount),
    });

    if (!result.success) {
      const errors = result.error.errors;
      const errorMessages = errors.map(err => `${err.path.join('.')}: ${err.message}`).join('\n');

      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor revisa los siguientes campos:\n" + errorMessages,
      });
      return;
    }

    createProjectMutation.mutate(result.data);
  };

  if (!user) {
    setLocation("/");
    return null;
  }

  const steps = [
    {
      title: "Información Básica",
      description: "Comencemos con la información básica sobre el proyecto",
      content: (
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título del Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="Regalo de Cumpleaños para Juan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos sobre la celebración y los planes para el regalo (mínimo 10 caracteres)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagen del Proyecto (Opcional)</FormLabel>
                  <FormControl>
                    <div className="flex flex-col gap-2">
                      {imageUpload.isUploading ? (
                        <div className="flex items-center justify-center p-4 border-2 border-dashed rounded-lg">
                          <div className="flex flex-col items-center gap-2">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">Subiendo imagen...</p>
                          </div>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="imageUploader"
                          onUploadBegin={() => {
                            setImageUpload(prev => ({ ...prev, isUploading: true }));
                          }}
                          onClientUploadComplete={(res) => {
                            setImageUpload({
                              isUploading: false,
                              preview: res?.[0]?.url || null
                            });
                            if (res?.[0]) {
                              field.onChange(res[0].url);
                              toast({
                                title: "Imagen subida",
                                description: "La imagen se ha subido correctamente",
                              });
                            }
                          }}
                          onUploadError={(error: Error) => {
                            setImageUpload({
                              isUploading: false,
                              preview: null
                            });
                            toast({
                              variant: "destructive",
                              title: "Error",
                              description: error.message,
                            });
                          }}
                        />
                      )}
                      {imageUpload.preview && !imageUpload.isUploading && (
                        <div className="relative w-32 h-32">
                          <img
                            src={imageUpload.preview}
                            alt="Preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              field.onChange("");
                              setImageUpload(prev => ({ ...prev, preview: null }));
                            }}
                          >
                            ×
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ),
    },
    {
      title: "Detalles",
      description: "¿Cuándo y dónde es la celebración?",
      content: (
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Evento (Opcional)</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ubicación (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Lugar de la celebración" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ),
    },
    {
      title: "Meta y Método de Pago",
      description: "Establece tu meta de recolección y cómo recibirás el dinero",
      content: (
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="target_amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Objetivo ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min="1"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Método de Pago</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex flex-col gap-2"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="cbu" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          CBU
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="efectivo" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Efectivo
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_details"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    {form.watch("payment_method") === "cbu"
                      ? "Número de CBU"
                      : "Detalles para la entrega del efectivo"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        form.watch("payment_method") === "cbu"
                          ? "Ingresa tu CBU"
                          : "Especifica cómo y dónde se entregará el efectivo"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ),
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <Button variant="outline" onClick={() => setLocation("/")}>
        Volver a Proyectos
      </Button>

      <Card>
        <CardContent className="pt-6">
          <WizardForm
            steps={steps}
            onComplete={handleSubmit}
            isSubmitting={createProjectMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}