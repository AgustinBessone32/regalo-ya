import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import {
  Loader2,
  CalendarIcon,
  MapPinIcon,
  Users,
  Bell,
  BellOff,
  Gift,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import { useConfetti } from "@/hooks/use-confetti";
import { useUser } from "@/hooks/use-user";
import type { Project, Contribution } from "@db/schema";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ShareButton } from "@/components/ShareButton";
import { useNotifications } from "@/hooks/use-notifications";

import { MetaTags } from "@/components/MetaTags";
import { EmojiReaction } from "@/components/EmojiReaction";
import { ContributionMetrics } from "@/components/ContributionMetrics";
import { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";

const contributionSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  message: z.string().optional(),
});

const paymentSchema = z.object({
  amount: z.coerce.number().min(1, "El monto debe ser mayor a 0"),
  description: z.string().optional(),
});

type ProjectWithDetails = Project & {
  creator: { email: string };
  contributions: Contribution[];
  reactions: { emoji: string; count: number; reacted: boolean }[];
  contribution_count: number;
  progress_percentage: number;
  payment_details: {
    payer_email: string;
    amount: number;
    description?: string;
    created_at: string;
  }[];
  isOwner: boolean;
  fixed_amounts?: string;
  allow_custom_amount?: boolean;
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Generate the full shareable URL
  const shareableUrl = `${window.location.origin}/projects/${id}`;

  const {
    data: project,
    isLoading,
    error,
  } = useQuery<ProjectWithDetails>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  const form = useForm<z.infer<typeof contributionSchema>>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      name: "",
      amount: 0,
      message: "",
    },
  });

  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);

  const paymentForm = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      description: "",
    },
  });

  const { fire: fireConfetti } = useConfetti();
  const contributeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contributionSchema>) => {
      if (!user) {
        setLocation("/auth");
        throw new Error("Se requiere autenticación");
      }

      const response = await fetch(`/api/projects/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al realizar la contribución");
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      form.reset();
      toast({
        title: "¡Éxito!",
        description: "¡Gracias por tu contribución!",
      });

      // Check if this contribution reached the goal
      const newTotal = (project?.current_amount || 0) + data.amount;
      if (project?.target_amount && newTotal >= project.target_amount) {
        fireConfetti();
        toast({
          title: "🎉 ¡Meta Alcanzada!",
          description:
            "¡Felicitaciones! ¡El proyecto ha alcanzado su meta de financiamiento!",
        });
      }
    },
    onError: (error: Error) => {
      if (error.message === "Se requiere autenticación") {
        toast({
          title: "Autenticación Requerida",
          description:
            "Por favor, inicia sesión o regístrate para contribuir a este proyecto",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: error.message,
        });
      }
    },
  });

  const handleContribute = async (data: z.infer<typeof contributionSchema>) => {
    contributeMutation.mutate(data);
  };

  const handleMercadoPagoPayment = async (
    data: z.infer<typeof paymentSchema>
  ) => {
    try {
      if (!user) {
        setLocation("/auth");
        return;
      }

      const response = await fetch(`/api/projects/${id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al crear el enlace de pago");
      }

      const { paymentUrl } = await response.json();

      // Redirect to MercadoPago
      window.open(paymentUrl, "_blank");
      setIsPaymentDialogOpen(false);

      toast({
        title: "Redirigiendo a MercadoPago",
        description: "Se abrió una nueva ventana para completar el pago",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const { permission, requestPermission, scheduleNotification } =
    useNotifications();

  const handleNotificationToggle = async () => {
    if (permission !== "granted") {
      const granted = await requestPermission();
      if (granted && project?.event_date) {
        scheduleNotification(
          new Date(project.event_date),
          [1, 7, 30],
          project.title
        );
        toast({
          title: "Notificaciones activadas",
          description: "Recibirás recordatorios sobre este evento",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Notificaciones desactivadas",
        description:
          "Puedes reactivar las notificaciones desde la configuración de tu navegador",
      });
    }
  };

  // Handle unauthorized access or project not found
  useEffect(() => {
    if (error?.message === "You don't have access to this project") {
      toast({
        variant: "destructive",
        title: "Acceso denegado",
        description: "No tienes permiso para ver este proyecto",
      });
      setLocation("/");
    }
  }, [error, toast, setLocation]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    toast({
      variant: "destructive",
      title: "Error",
      description: "No se pudo cargar el proyecto",
    });
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              No se pudo cargar el proyecto
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              Proyecto no encontrado
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setLocation("/")}
            >
              Volver al inicio
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentAmount = project.current_amount ?? 0;

  // Función para determinar si el evento ya ha finalizado
  const isEventFinished = () => {
    if (!project.event_date) return false;
    const eventDate = new Date(project.event_date);
    const now = new Date();
    return eventDate < now;
  };

  const eventFinished = isEventFinished();

  return (
    <>
      <MetaTags
        title={`${project.title} - RegaloYa`}
        description={project.description || ""}
        url={shareableUrl}
        image={project.image_url || undefined}
      />

      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Volver a Proyectos
          </Button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {project.isOwner && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNotificationToggle}
                title={
                  permission === "granted"
                    ? "Notificaciones activadas"
                    : "Activar notificaciones"
                }
              >
                {permission === "granted" ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            )}

            <ShareButton
              title={`${project.title} - Colección de Regalos de Cumpleaños`}
              description={project.description || ""}
              url={shareableUrl}
            />
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-3 leading-tight">
                {project.title}
              </h1>
              {project.image_url && (
                <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      console.error("Image load error:", e);
                      const img = e.target as HTMLImageElement;
                      img.style.display = "none";
                    }}
                  />
                </div>
              )}
              <p className="text-muted-foreground leading-relaxed">
                {project.description}
              </p>
            </div>

            <EmojiReaction
              projectId={project.id}
              initialReactions={project.reactions}
            />

            <div className="flex flex-col gap-3">
              {project.event_date && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <CalendarIcon className="h-4 w-4 flex-shrink-0" />
                    <span className="break-words">
                      {format(new Date(project.event_date), "PPP")}
                    </span>
                  </div>
                  <CountdownTimer eventDate={project.event_date} />
                </>
              )}

              {project.location && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <MapPinIcon className="h-4 w-4 flex-shrink-0" />
                  <span className="break-words">{project.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Users className="h-4 w-4 flex-shrink-0" />
                <span className="break-words">
                  Creado por {project.creator.email}
                </span>
              </div>
            </div>

            {eventFinished && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  ⏰ Este evento ya ha finalizado. Las contribuciones están
                  cerradas.
                </p>
              </div>
            )}

            <Dialog
              open={isPaymentDialogOpen}
              onOpenChange={setIsPaymentDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary hover:text-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={eventFinished}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {eventFinished ? "Evento Finalizado" : "Agregar Regalo"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Agregar Regalo con MercadoPago</DialogTitle>
                  <DialogDescription>
                    Ingresa el monto que deseas enviar como regalo para{" "}
                    {project.title}
                  </DialogDescription>
                </DialogHeader>
                <Form {...paymentForm}>
                  <form
                    onSubmit={paymentForm.handleSubmit(
                      handleMercadoPagoPayment
                    )}
                    className="space-y-4"
                  >
                    <FormField
                      control={paymentForm.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Monto ($ARS)</FormLabel>
                          <FormControl>
                            <div className="space-y-3">
                              {/* Fixed Amounts */}
                              {project.fixed_amounts &&
                                (() => {
                                  try {
                                    const fixedAmounts = JSON.parse(
                                      project.fixed_amounts
                                    );
                                    if (
                                      Array.isArray(fixedAmounts) &&
                                      fixedAmounts.length > 0
                                    ) {
                                      return (
                                        <div className="space-y-2">
                                          <p className="text-sm text-muted-foreground">
                                            Montos sugeridos:
                                          </p>
                                          <div className="grid grid-cols-2 gap-2">
                                            {fixedAmounts.map(
                                              (amount: number) => (
                                                <Button
                                                  key={amount}
                                                  type="button"
                                                  variant={
                                                    field.value === amount
                                                      ? "default"
                                                      : "outline"
                                                  }
                                                  className="h-10"
                                                  onClick={() =>
                                                    field.onChange(amount)
                                                  }
                                                >
                                                  ${amount.toLocaleString()}
                                                </Button>
                                              )
                                            )}
                                          </div>
                                        </div>
                                      );
                                    }
                                  } catch (error) {
                                    console.error(
                                      "Error parsing fixed_amounts:",
                                      error
                                    );
                                  }
                                  return null;
                                })()}

                              {/* Custom Amount Input */}
                              {project.allow_custom_amount !== false && (
                                <div className="space-y-2">
                                  {project.fixed_amounts && (
                                    <p className="text-sm text-muted-foreground">
                                      O ingresa un monto personalizado:
                                    </p>
                                  )}
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                                      $
                                    </span>
                                    <Input
                                      type="number"
                                      placeholder="Ej: 1000"
                                      className="pl-6"
                                      {...field}
                                    />
                                  </div>
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Monto a abonar */}
                    {paymentForm.watch("amount") > 0 && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">
                          Monto a abonar:
                        </p>
                        <p className="text-2xl font-bold text-primary">
                          ${paymentForm.watch("amount").toLocaleString()}
                        </p>
                      </div>
                    )}

                    <FormField
                      control={paymentForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensaje (Opcional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Mensaje para el regalo..."
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => setIsPaymentDialogOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit" className="w-full">
                        <Gift className="h-4 w-4 mr-2" />
                        Continuar a MercadoPago
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

            <Card>
              <CardContent className="pt-4 sm:pt-6">
                <Progress
                  value={project.progress_percentage || 0}
                  className="h-3 mb-4"
                />
                <div className="flex flex-col sm:flex-row sm:justify-between gap-2 mb-3">
                  <span className="text-sm text-muted-foreground">
                    ${currentAmount} recaudados
                  </span>
                  {project.target_amount && (
                    <span className="text-sm font-medium">
                      ${project.target_amount} meta
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <span>{project.contribution_count || 0} pagos</span>
                  <span className="font-medium text-primary">
                    {project.progress_percentage || 0}% completado
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4 sm:space-y-6 lg:order-last order-first">
            {/* Sharing Block */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Compartir Proyecto</CardTitle>
              </CardHeader>
              <CardContent>
                <ShareButton
                  title={project.title}
                  description={project.description}
                  url={window.location.href}
                />
              </CardContent>
            </Card>

            {/* Contribution Metrics */}
            <ContributionMetrics
              contributors={project.payment_details || []}
              totalAmount={project.current_amount || 0}
            />

            {!project.isOwner && (
              <Card>
                <CardHeader>
                  <CardTitle>Hacer una Contribución</CardTitle>
                  {eventFinished && (
                    <p className="text-sm text-muted-foreground">
                      Este evento ya ha finalizado. No se pueden realizar nuevas
                      contribuciones.
                    </p>
                  )}
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit(handleContribute)}
                      className="space-y-4"
                    >
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tu Nombre</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monto ($)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Mensaje (Opcional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="submit"
                        className="w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={contributeMutation.isPending || eventFinished}
                      >
                        {contributeMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        {eventFinished
                          ? "Evento Finalizado"
                          : user
                          ? "Contribuir"
                          : "Inicia sesión para contribuir"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {project.contributions.length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">
                    Contribuciones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.contributions.map((contribution) => (
                      <div
                        key={contribution.id}
                        className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 pb-3 border-b last:border-0 last:pb-0"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm break-words">
                            {contribution.contributor_name}
                          </p>
                          {contribution.message && (
                            <p className="text-xs text-muted-foreground mt-1 break-words">
                              {contribution.message}
                            </p>
                          )}
                        </div>
                        <span className="font-medium text-sm flex-shrink-0 self-start">
                          ${contribution.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
