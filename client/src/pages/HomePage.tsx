import { useQuery } from "@tanstack/react-query";
import ProjectCard from "@/components/ProjectCard";
import { Loader2 } from "lucide-react";
import type { Project } from "@db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@/hooks/use-user";

type ProjectWithDetails = Project & { 
  contributions: { amount: number }[];
  contribution_count?: number;
};

export default function HomePage() {
  const { user } = useUser();
  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filter projects based on ownership and contributions
  const myProjects = projects?.filter(project => project.creator_id === user?.id) || [];
  const contributedProjects = projects?.filter(
    project => project.creator_id !== user?.id && project.contribution_count && project.contribution_count > 0
  ) || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Birthday Projects</h1>
        <p className="text-muted-foreground">
          Browse and contribute to birthday gift collections
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          <TabsTrigger value="my">My Projects</TabsTrigger>
          <TabsTrigger value="contributed">Contributing</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
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
        </TabsContent>

        <TabsContent value="my" className="mt-6">
          {myProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              You haven't created any projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="contributed" className="mt-6">
          {contributedProjects.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              You haven't contributed to any projects yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contributedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}