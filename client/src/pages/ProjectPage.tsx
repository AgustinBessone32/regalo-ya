import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, MapPinIcon, Users, Bell, BellOff } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useConfetti } from "@/hooks/use-confetti";
import { useUser } from "@/hooks/use-user";
import type { Project, Contribution } from "@db/schema";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ShareButton } from "@/components/ShareButton";
import { useNotifications } from "@/hooks/use-notifications";
import { BudgetAnalytics } from "@/components/BudgetAnalytics";
import { MetaTags } from "@/components/MetaTags";
import { EmojiReaction } from "@/components/EmojiReaction";
import { useEffect } from "react";

const contributionSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  message: z.string().optional(),
});

type ProjectWithDetails = Project & {
  creator: { username: string };
  contributions: Contribution[];
  reactions: { emoji: string; count: number; reacted: boolean }[];
  shares: {
    total: number;
    by_platform: { platform: string; count: number }[];
  };
  avg_amount: number;
  median_amount: number;
  min_amount: number;
  max_amount: number;
  total_contributions: number;
  contribution_history: number[];
};

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useUser();

  // Generate the full shareable URL
  const shareableUrl = `${window.location.origin}/projects/${id}`;

  const { data: project, isLoading, error } = useQuery<ProjectWithDetails>({
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

  const { fire: fireConfetti } = useConfetti();
  const contributeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contributionSchema>) => {
      if (!user) {
        setLocation("/auth");
        throw new Error("Authentication required");
      }

      const response = await fetch(`/api/projects/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to contribute');
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      form.reset();
      toast({
        title: "Success",
        description: "Thank you for your contribution!",
      });

      // Check if this contribution reached the goal
      const newTotal = (project?.current_amount || 0) + data.amount;
      if (project?.target_amount && newTotal >= project.target_amount) {
        fireConfetti();
        toast({
          title: "🎉 Goal Reached!",
          description: "Congratulations! The project has reached its funding goal!",
        });
      }
    },
    onError: (error: Error) => {
      if (error.message === "Authentication required") {
        toast({
          title: "Authentication Required",
          description: "Please log in or register to contribute to this project",
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

  const { permission, requestPermission, scheduleNotification } = useNotifications();

  const handleNotificationToggle = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (granted && project?.event_date) {
        scheduleNotification(
          new Date(project.event_date),
          [1, 7, 30],
          project.title
        );
        toast({
          title: "Notifications enabled",
          description: "You will receive reminders about this event",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Notifications disabled",
        description: "You can re-enable notifications from your browser settings",
      });
    }
  };

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
  const progress = (currentAmount / (project.target_amount || 1)) * 100;

  return (
    <>
      <MetaTags
        title={`${project.title} - RegaloYa`}
        description={project.description || ''}
        url={shareableUrl}
        image={project.image_url || undefined}
      />

      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={() => setLocation("/")}>
            Volver a Proyectos
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleNotificationToggle}
              title={permission === 'granted' ? 'Notificaciones activadas' : 'Activar notificaciones'}
            >
              {permission === 'granted' ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>

            <ShareButton
              title={`${project.title} - Colección de Regalos de Cumpleaños`}
              description={project.description || ''}
              url={shareableUrl}
            />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
              {project.image_url && (
                <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={project.image_url}
                    alt={project.title}
                    className="object-cover w-full h-full"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image load error:', e);
                      const img = e.target as HTMLImageElement;
                      img.style.display = 'none';
                    }}
                  />
                </div>
              )}
              <p className="text-muted-foreground">{project.description}</p>
            </div>

            <EmojiReaction
              projectId={project.id}
              initialReactions={project.reactions}
            />

            <div className="flex flex-col gap-2">
              {project.event_date && (
                <>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{format(new Date(project.event_date), "PPP")}</span>
                  </div>
                  <CountdownTimer eventDate={project.event_date} />
                </>
              )}

              {project.location && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  <span>{project.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>Creado por {project.creator.username}</span>
              </div>
            </div>

            <Card>
              <CardContent className="pt-6">
                <Progress value={progress} className="h-2 mb-4" />
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">
                    ${currentAmount} recaudados
                  </span>
                  {project.target_amount && (
                    <span className="font-medium">
                      ${project.target_amount} meta
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {project.contributions.length} contribuciones
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <BudgetAnalytics
              avgAmount={project.avg_amount || 0}
              medianAmount={project.median_amount || 0}
              minAmount={project.min_amount || 0}
              maxAmount={project.max_amount || 0}
              totalContributions={project.total_contributions || 0}
              contributionHistory={project.contribution_history || []}
              reactionCounts={project.reactions}
              totalShares={project.shares?.total || 0}
              platformShares={project.shares?.by_platform || []}
            />
            <Card>
              <CardHeader>
                <CardTitle>Hacer una Contribución</CardTitle>
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
                      className="w-full"
                      disabled={contributeMutation.isPending}
                    >
                      {contributeMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {user ? 'Contribuir' : 'Inicia sesión para contribuir'}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {project.contributions.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Contribuciones Recientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {project.contributions.map((contribution) => (
                      <div
                        key={contribution.id}
                        className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">{contribution.contributor_name}</p>
                          {contribution.message && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {contribution.message}
                            </p>
                          )}
                        </div>
                        <span className="font-medium">${contribution.amount}</span>
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