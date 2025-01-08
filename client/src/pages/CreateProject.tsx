import { useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { WizardForm } from "@/components/WizardForm";
import { useUser } from "@/hooks/use-user";

const projectSchema = z.object({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  description: z.string().min(10, "La descripción debe tener al menos 10 caracteres"),
  target_amount: z.coerce.number().min(1, "El monto objetivo debe ser mayor a 0"),
  location: z.string().optional(),
  event_date: z.string().optional(),
  is_public: z.boolean().default(false),
});

export default function CreateProject() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();

  if (!user) {
    setLocation("/");
    return null;
  }

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      target_amount: 0,
      location: "",
      event_date: "",
      is_public: false,
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: z.infer<typeof projectSchema>) => {
      console.log("Enviando datos al servidor:", data);
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          target_amount: Number(data.target_amount),
        }),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.message || "Error al crear el proyecto");
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

  const handleSubmit = async () => {
    const values = form.getValues();
    console.log("Valores del formulario:", values);

    const validationResult = projectSchema.safeParse(values);
    if (!validationResult.success) {
      console.error("Error de validación:", validationResult.error);
      toast({
        variant: "destructive",
        title: "Error de validación",
        description: "Por favor revisa los campos del formulario",
      });
      return;
    }

    createProjectMutation.mutate(validationResult.data);
  };

  const steps = [
    {
      title: "Información Básica",
      description: "Comencemos con la información básica sobre el proyecto",
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
      title: "Meta",
      description: "Establece tu meta de recolección",
      content: (
        <Form {...form}>
          <form className="space-y-4">
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
                      step="1"
                      placeholder="0"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
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