import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { Loader2, CalendarIcon, MapPinIcon, Users, Share2, Facebook, Twitter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Project, Contribution } from "@db/schema";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ShareButton } from "@/components/ShareButton";

const contributionSchema = z.object({
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
  contributorName: z.string().min(2, "Name must be at least 2 characters"),
  message: z.string().optional(),
});

type ProjectWithDetails = Project & {
  creator: { username: string };
  contributions: Contribution[];
};

export default function ProjectPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: project, isLoading } = useQuery<ProjectWithDetails>({
    queryKey: [`/api/projects/${id}`],
  });

  const form = useForm<z.infer<typeof contributionSchema>>({
    resolver: zodResolver(contributionSchema),
    defaultValues: {
      amount: 0,
      contributorName: "",
      message: "",
    },
  });

  const contributeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof contributionSchema>) => {
      const response = await fetch(`/api/projects/${id}/contribute`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}`] });
      form.reset();
      toast({
        title: "Success",
        description: "Thank you for your contribution!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!project) {
    setLocation("/");
    return null;
  }

  const currentAmount = project.currentAmount ?? 0;
  const progress = (currentAmount / (project.targetAmount || 1)) * 100;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={() => setLocation("/")}>
          Back to Projects
        </Button>

        <ShareButton
          title={project.title}
          description={project.description || ''}
          url={window.location.href}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>

          <div className="flex flex-col gap-2">
            {project.eventDate && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(new Date(project.eventDate), "PPP")}</span>
                </div>
                <CountdownTimer eventDate={project.eventDate} />
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
              <span>Created by {project.creator.username}</span>
            </div>
          </div>

          <Card>
            <CardContent className="pt-6">
              <Progress value={progress} className="h-2 mb-4" />
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">
                  ${currentAmount} raised
                </span>
                {project.targetAmount && (
                  <span className="font-medium">
                    ${project.targetAmount} goal
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {project.contributions.length} contributions
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Make a Contribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit((data) => contributeMutation.mutate(data))}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contributorName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Message (Optional)</FormLabel>
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
                    Contribute
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {project.contributions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Contributions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {project.contributions.map((contribution) => (
                    <div
                      key={contribution.id}
                      className="flex justify-between items-start pb-4 border-b last:border-0 last:pb-0"
                    >
                      <div>
                        <p className="font-medium">{contribution.contributorName}</p>
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
  );
}