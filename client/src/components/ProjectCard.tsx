import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";
import type { Project } from "@db/schema";
import { CountdownTimer } from "./CountdownTimer";

type ProjectCardProps = {
  project: Project & {
    contributions: { amount: number }[];
  };
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const currentAmount = project.currentAmount ?? 0;
  const progress = (currentAmount / (project.targetAmount || 1)) * 100;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{project.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        {project.eventDate && (
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(project.eventDate), "PPP")}</span>
            </div>
            <CountdownTimer eventDate={project.eventDate} />
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
            {project.targetAmount && (
              <span className="font-medium">
                ${project.targetAmount} goal
              </span>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/projects/${project.id}`}>
          <Button className="w-full">View Project</Button>
        </Link>
      </CardFooter>
    </Card>
  );
}