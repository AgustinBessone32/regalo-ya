import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import ProjectCard from "@/components/ProjectCard";
import { Loader2, Plus, Star, Heart } from "lucide-react";
import type { Project } from "@db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

type ProjectWithDetails = Project & {
  contribution_count: number;
};

export default function HomePage() {
  const { user } = useUser();
  const { data: projects, isLoading } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!projects) {
    return null;
  }

  const myProjects = projects.filter(p => p.creator_id === user?.id);
  const contributedProjects = projects.filter(p => 
    p.creator_id !== user?.id && p.contribution_count > 0
  );

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">RegaloYa</h1>
          <p className="text-muted-foreground">
            Create and manage collaborative gift collections
          </p>
        </div>
        <Link href="/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Project
          </Button>
        </Link>
      </div>

      <div className="bg-card rounded-lg p-4 border">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px] mb-6">
            <TabsTrigger value="all" className="flex items-center gap-2">
              All Projects
              <span className="px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                {projects.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="my" className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              My Projects
              <span className="px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                {myProjects.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="contributed" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Contributing
              <span className="px-2 py-0.5 text-xs bg-primary/10 rounded-full">
                {contributedProjects.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {projects.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No projects found. Create one to get started!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my">
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

          <TabsContent value="contributed">
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
    </div>
  );
}