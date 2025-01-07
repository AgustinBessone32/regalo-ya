import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Project } from "@db/schema";
import { CountdownTimer } from "./CountdownTimer";
import { ShareButton } from "./ShareButton";

type ProjectCardProps = {
  project: Project & {
    contributions: { amount: number }[];
  };
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const currentAmount = project.current_amount ?? 0;
  const progress = (currentAmount / (project.target_amount || 1)) * 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        {project.event_date && (
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(project.event_date), "PPP")}</span>
            </div>
            <CountdownTimer eventDate={project.event_date} />
          </div>
        )}

        {project.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <MapPinIcon className="h-4 w-4" />
            <span>{project.location}</span>
          </div>
        )}

        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              ${currentAmount} raised
            </span>
            {project.target_amount && (
              <span className="font-medium">
                ${project.target_amount} goal
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between gap-2">
        <Link href={`/projects/${project.id}`}>
          <Button>View Project</Button>
        </Link>

        <ShareButton
          title={project.title}
          description={project.description || ''}
          url={`${window.location.origin}/projects/${project.id}`}
        />
      </CardFooter>
    </Card>
  );
}