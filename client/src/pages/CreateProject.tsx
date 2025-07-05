import { useState } from "react";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { WizardForm } from "@/components/WizardForm";
import { useUser } from "@/hooks/use-user";
import { UploadButton } from "@/components/ui/upload-button";
import { Loader2, PlusIcon, XIcon } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const projectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z
    .string()
    .min(10, "La descripción debe tener al menos 10 caracteres"),
  image_url: z.string().optional(),

  location: z.string().optional(),
  event_date: z.string().min(1, "La fecha del evento es requerida").default(""),

  payment_method: z.enum(["mercadopago"]).default("mercadopago"),
  payment_details: z.string().optional(),
  fixed_amounts: z.array(z.number().min(1)).optional(),
  allow_custom_amount: z.boolean().default(true),
  recipient_account: z.string().optional(),
});

type FormData = z.infer<typeof projectSchema> & {
  image_url?: string;
  location?: string;
  payment_details?: string;
  fixed_amounts?: number[];
  allow_custom_amount?: boolean;
  recipient_account?: string;
};

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
  const [fixedAmounts, setFixedAmounts] = useState<number[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      image_url: "",
      location: "",
      event_date: "",

      payment_method: "mercadopago",
      payment_details: "",
      fixed_amounts: [],
      allow_custom_amount: true,
      recipient_account: "",
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          target_amount: 0, // Valor por defecto ya que no usamos monto objetivo
          event_date: data.event_date || null,
          fixed_amounts: data.fixed_amounts
            ? JSON.stringify(data.fixed_amounts)
            : null,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error creating project");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${data.id}`] });

      toast({
        title: "¡Éxito!",
        description: "Proyecto creado correctamente",
      });

      setTimeout(() => {
        setIsCreating(false);
        setLocation(`/projects/${data.id}`);
      }, 1500); // Mostrar feedback por 1.5 segundos más
    },
    onError: (error: Error) => {
      setIsCreating(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSubmit = () => {
    const values = form.getValues();
    const formData = {
      ...values,
      event_date: values.event_date || null,
    };

    const result = projectSchema.safeParse(formData);

    if (!result.success) {
      const errors = result.error.errors;
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: errors.map((err) => err.message).join("\n"),
      });
      return;
    }

    setIsCreating(true);
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
      validation: () => {
        const values = form.getValues();
        const errors: string[] = [];

        if (!values.title || values.title.length < 3) {
          errors.push("El título debe tener al menos 3 caracteres");
        }

        if (!values.description || values.description.length < 10) {
          errors.push("La descripción debe tener al menos 10 caracteres");
        }



        return {
          isValid: errors.length === 0,
          errors,
        };
      },
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
                    <Input
                      placeholder="Regalo de Cumpleaños para Juan"
                      {...field}
                    />
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
                      placeholder="Cuéntanos sobre la celebración y los planes para el regalo"
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
                            <p className="text-sm text-muted-foreground">
                              Subiendo imagen...
                            </p>
                          </div>
                        </div>
                      ) : (
                        <UploadButton
                          endpoint="imageUploader"
                          onUploadBegin={() => {
                            setImageUpload((prev) => ({
                              ...prev,
                              isUploading: true,
                            }));
                          }}
                          onClientUploadComplete={(res) => {
                            console.log("Upload completed:", res);
                            const fileUrl = res?.[0]?.url;
                            setImageUpload({
                              isUploading: false,
                              preview: fileUrl || null,
                            });
                            field.onChange(fileUrl);
                            toast({
                              title: "Imagen subida",
                              description:
                                "La imagen se ha subido correctamente",
                            });
                          }}
                          onUploadError={(error: Error) => {
                            console.error("Upload error:", error);
                            setImageUpload({
                              isUploading: false,
                              preview: null,
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
                            onError={(e) => {
                              console.error("Image load error:", e);
                              const img = e.target as HTMLImageElement;
                              console.log("Failed URL:", img.src);
                            }}
                          />
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              field.onChange("");
                              setImageUpload((prev) => ({
                                ...prev,
                                preview: null,
                              }));
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
      validation: () => {
        const values = form.getValues();
        const errors: string[] = [];

        if (!values.event_date || values.event_date.trim() === "") {
          errors.push("La fecha del evento es requerida");
        }

        return {
          isValid: errors.length === 0,
          errors,
        };
      },
      content: (
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <FormField
              control={form.control}
              name="event_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha del Evento</FormLabel>
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
                  <p className="text-sm text-muted-foreground">
                    Coloca la ubicación de Google Maps o la dirección del lugar.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      ),
    },
    {
      title: "Opciones de Contribución",
      description:
        "Configura cómo las personas pueden contribuir y donde recibirás el dinero",
      validation: () => {
        const values = form.getValues();
        const errors: string[] = [];



        return {
          isValid: errors.length === 0,
          errors,
        };
      },
      content: (
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <div className="space-y-4">
              <FormLabel className="text-base font-medium">
                Opciones de Contribución
              </FormLabel>

              {/* Fixed Amounts Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Montos Fijos</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newAmounts = [...fixedAmounts, 0];
                      setFixedAmounts(newAmounts);
                      form.setValue("fixed_amounts", newAmounts);
                    }}
                  >
                    <PlusIcon className="h-4 w-4 mr-1" />
                    Agregar Monto
                  </Button>
                </div>

                {fixedAmounts.map((amount, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="1"
                      placeholder="Monto en $"
                      value={amount || ""}
                      onChange={(e) => {
                        const value = Number(e.target.value);
                        const newAmounts = [...fixedAmounts];
                        newAmounts[index] = value;
                        setFixedAmounts(newAmounts);
                        form.setValue(
                          "fixed_amounts",
                          newAmounts.filter((a) => a > 0)
                        );
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAmounts = fixedAmounts.filter(
                          (_, i) => i !== index
                        );
                        setFixedAmounts(newAmounts);
                        form.setValue("fixed_amounts", newAmounts);
                      }}
                    >
                      <XIcon className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {fixedAmounts.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    Agrega montos fijos que los contribuyentes puedan elegir
                  </p>
                )}
              </div>

              {/* Allow Custom Amount Option */}
              <FormField
                control={form.control}
                name="allow_custom_amount"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Permitir monto personalizado</FormLabel>
                      <p className="text-sm text-muted-foreground">
                        Los contribuyentes podrán elegir cuánto aportar
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>


          </form>
        </Form>
      ),
    },
  ];

  // Pantalla de feedback mientras se crea el proyecto
  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-purple-500" />
                <div className="absolute inset-0 h-16 w-16 rounded-full border-4 border-purple-200 opacity-25"></div>
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Creando Proyecto
                </h2>
                <p className="text-gray-600">
                  Solo unos segundos...
                </p>
              </div>
              
              <div className="text-sm text-gray-500 space-y-1">
                <p>✓ Configurando el proyecto</p>
                <p>✓ Estableciendo los métodos de pago</p>
                <p>🔄 Finalizando la configuración</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
