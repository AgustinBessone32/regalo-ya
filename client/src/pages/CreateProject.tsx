import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, MapPinIcon, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WizardForm } from "@/components/WizardForm";
import { useUser } from "@/hooks/use-user";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useState } from "react";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const projectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  targetAmount: z.coerce.number().min(1, "El monto objetivo debe ser mayor a 0"),
  location: z.string().min(3, "La ubicación debe tener al menos 3 caracteres").max(100, "La ubicación debe tener menos de 100 caracteres"),
  eventDate: z.string().refine((date) => {
    const eventDate = new Date(date);
    const today = new Date();
    return eventDate > today;
  }, "La fecha del evento debe ser en el futuro"),
  isPublic: z.boolean().default(false),
  image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "El tamaño máximo del archivo es 5MB.")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Solo se aceptan archivos .jpg, .jpeg, .png y .webp."
    )
    .optional(),
});

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Redirect to login if not authenticated
  if (!user) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      targetAmount: 0,
      location: "",
      eventDate: "",
      isPublic: false,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      const formData = new FormData();
      Object.entries(data).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (typeof value !== 'undefined' && value !== null) {
          formData.append(key, value.toString());
        }
      });

      const response = await fetch("/api/projects", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    }
  };

  const steps = [
    {
      title: "Información Básica",
      description: "Comencemos con la información básica sobre el proyecto de cumpleaños",
      content: (
        <Form {...form}>
          <form className="space-y-4">
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
                      placeholder="Cuéntanos sobre la celebración y los planes para el regalo..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image"
              render={() => (
                <FormItem>
                  <FormLabel>Foto del Cumpleañero</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <Input
                        type="file"
                        accept={ACCEPTED_IMAGE_TYPES.join(",")}
                        onChange={handleImageChange}
                        className="cursor-pointer"
                      />
                      {previewImage && (
                        <AspectRatio ratio={1}>
                          <img
                            src={previewImage}
                            alt="Vista previa"
                            className="rounded-lg object-cover h-full w-full"
                          />
                        </AspectRatio>
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
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="eventDate"
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
                  <FormLabel>Ubicación</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Lugar de la fiesta o dirección"
                        className="pl-9"
                        {...field}
                      />
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
      title: "Meta",
      description: "Establece tu meta de recolección de regalos",
      content: (
        <Form {...form}>
          <form className="space-y-4">
            <FormField
              control={form.control}
              name="targetAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Monto Objetivo ($)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ingresa el monto objetivo"
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
            onComplete={() => createProjectMutation.mutate(form.getValues())}
            isSubmitting={createProjectMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}