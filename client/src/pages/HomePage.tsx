import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ProjectCard";
import { Loader2 } from "lucide-react";
import type { Project } from "@db/schema";

export default function HomePage() {
  const { data: projects, isLoading } = useQuery<(Project & { contributions: { amount: number }[] })[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Birthday Projects</h1>
        <p className="text-muted-foreground">
          Browse and contribute to birthday gift collections
        </p>
      </div>

      {projects?.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No projects found. Create one to get started!
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects?.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
