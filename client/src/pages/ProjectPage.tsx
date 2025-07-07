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
  Heart,
  ArrowLeft,
  AlertCircle,
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
  contributions: Array<{
    id: number;
    amount: number;
    message?: string;
    description?: string;
    contributor_name: string;
    project_id: number;
    created_at: string;
    type?: string;
  }>;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  contribution_count: number;
  progress_percentage: number;
  payment_details: {
    payer_name: string;
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

  // Check if success parameter is present
  const urlParams = new URLSearchParams(window.location.search);
  const isSuccess = urlParams.get("success") === "true";
  const isError = urlParams.get("success") === "false";

  const {
    data: project,
    isLoading,
    error,
  } = useQuery<ProjectWithDetails>({
    queryKey: [`/api/projects/${id}`],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${id}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar el proyecto");
      }
      return response.json();
    },
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
        setLocation(`/auth?redirect=/projects/${id}`);
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
        setLocation(`/auth?redirect=/projects/${id}`);
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

  const { permission, requestPermission, scheduleNotification, isSupported } =
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

  // Handle errors with toast
  useEffect(() => {
    if (error && !isLoading) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cargar el proyecto",
      });
    }
  }, [error, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
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

  console.log("ppp", project.payment_details);

  // Show success or error page if success parameter is present
  if (isSuccess || isError) {
    return (
      <>
        <MetaTags
          title={
            isSuccess
              ? "¡Gracias por tu contribución! - RegaloYa"
              : "Error en el pago - RegaloYa"
          }
          description={
            isSuccess
              ? "Tu contribución ha sido procesada exitosamente"
              : "Hubo un problema con el procesamiento del pago"
          }
          url={shareableUrl}
        />

        <div className="min-h-[70vh] flex items-center justify-center px-4 sm:px-0">
          <div className="w-full max-w-md mx-auto text-center space-y-4 sm:space-y-6">
            <div
              className={`mx-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center ${
                isSuccess ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isSuccess ? (
                <Heart className="h-8 w-8 sm:h-10 sm:w-10 text-green-600 fill-current" />
              ) : (
                <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-red-600" />
              )}
            </div>

            <div className="space-y-3 sm:space-y-4">
              <h1
                className={`text-xl sm:text-2xl font-bold ${
                  isSuccess ? "text-green-700" : "text-red-700"
                }`}
              >
                {isSuccess
                  ? "¡Gracias por tu contribución!"
                  : "Lamentamos el inconveniente"}
              </h1>

              <div className="space-y-2 sm:space-y-3">
                {isSuccess ? (
                  <>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
                      Tu regalo ha sido procesado exitosamente y será entregado
                      al cumpleañero.
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                      Recibirás una confirmación por email con los detalles de
                      tu contribución.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-2 sm:px-0">
                      Lamentamos que no hayas podido completar tu regalo en este
                      momento.
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground px-4 sm:px-0">
                      Puedes intentarlo nuevamente en unos minutos. Si el
                      problema persiste, contacta con soporte.
                    </p>
                  </>
                )}
              </div>
            </div>

            <Button
              onClick={() => {
                // Usar window.location para limpiar completamente los parámetros de la URL
                window.location.href = `/projects/${id}`;
              }}
              className="w-full h-12 sm:h-auto text-sm sm:text-base"
              size="lg"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Proyecto
            </Button>
          </div>
        </div>
      </>
    );
  }

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
          {user && (
            <Button variant="outline" onClick={() => setLocation("/")}>
              Volver a Proyectos
            </Button>
          )}

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {project.isOwner && isSupported && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleNotificationToggle}
                title={
                  permission === "granted"
                    ? "Notificaciones activadas"
                    : "Activar notificaciones"
                }
                className="hidden sm:flex"
              >
                {permission === "granted" ? (
                  <Bell className="h-4 w-4" />
                ) : (
                  <BellOff className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:gap-6 md:gap-8 lg:grid-cols-2">
          <div className="space-y-4 sm:space-y-6 order-1 lg:order-1">
            <div className="px-4 sm:px-0">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 leading-tight">
                {project.title.charAt(0).toUpperCase() + project.title.slice(1)}
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

            <div className="flex flex-col gap-3 px-4 sm:px-0">
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
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  size="lg"
                  disabled={eventFinished}
                >
                  <Gift className="h-4 w-4 mr-2" />
                  {eventFinished ? "Evento Finalizado" : "Regalar"}
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

          <div className="space-y-4 sm:space-y-6 order-2 lg:order-2">
            {/* Sharing Block */}
            <Card className="mb-4 sm:mb-0">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-lg">Compartir Proyecto</CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <ShareButton
                  title={project.title}
                  description={project.description}
                  url={window.location.href}
                />
              </CardContent>
            </Card>

            {/* Contribution Metrics - Only visible to owner */}
            {project.isOwner && Array.isArray(project.payment_details) && (
              <ContributionMetrics
                contributors={project.payment_details.map((payment) => ({
                  contributor_name: payment.payer_name,
                  amount: payment.amount,
                  description: payment.description,
                  created_at: payment.created_at,
                }))}
                totalAmount={project.current_amount || 0}
              />
            )}

            {/* Contribuciones Recientes - Solo para no propietarios */}
            {!project.isOwner && project.contributions.length > 0 && (
              <Card className="mt-4 sm:mt-0">
                <CardHeader className="pb-3 px-4 sm:px-6">
                  <CardTitle className="text-lg">
                    Contribuciones Recientes
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
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
                          {(contribution.message ||
                            contribution.description) && (
                            <p className="text-xs text-muted-foreground mt-1 break-words">
                              {contribution.message || contribution.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Banner para usuarios no registrados */}
      {!user && (
        <div className="mt-8 bg-gradient-to-r from-purple-50 to-pink-50 border-t border-purple-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  ¿Quieres crear tu propia colecta?
                </h3>
                <p className="text-sm text-gray-600">
                  Únete a RegaloYa y organiza colectas para cualquier ocasión
                  especial
                </p>
              </div>
              <Button
                onClick={() => (window.location.href = "/")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 font-medium whitespace-nowrap shadow-lg"
                size="lg"
              >
                Regístrate Gratis
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
