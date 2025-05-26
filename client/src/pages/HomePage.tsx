import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import ProjectCard from "@/components/ProjectCard";
import { Loader2, Plus, LogOut } from "lucide-react";
import type { Project } from "@db/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

type ProjectWithDetails = Project & {
  contribution_count: number;
  isOwner: boolean;
};

export default function HomePage() {
  const { user, logout } = useUser();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: projects, isLoading, error } = useQuery<ProjectWithDetails[]>({
    queryKey: ["/api/projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects", {
        credentials: "include"
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cargar los proyectos");
      }
      return response.json();
    },
    enabled: !!user,
    staleTime: 1000 * 60, // Consider data stale after 1 minute
    refetchOnMount: true,
    refetchOnWindowFocus: true
  });

  // Force refetch projects when component mounts
  useEffect(() => {
    if (user) {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
    }
  }, [queryClient, user]);

  const handleLogout = async () => {
    try {
      await logout();
      setLocation('/auth');
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al cerrar sesión"
      });
    }
  };

  useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Error al cargar los proyectos"
      });
    }
  }, [error, toast]);

  if (!user) {
    setLocation("/auth");
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const myProjects = projects?.filter(p => p.isOwner) || [];
  const contributedProjects = projects?.filter(p => !p.isOwner) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="space-y-8 pb-8">
        <div className="bg-white/60 backdrop-blur-sm border-b">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ¡Bienvenido, {user.username}!
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                  Gestiona tus proyectos de regalo colaborativo
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Link href="/create">
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Proyecto
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-purple-100">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 max-w-[500px] mb-8 bg-gray-100/50">
                <TabsTrigger value="all" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Todos
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {projects?.length || 0}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="my" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Mis Proyectos
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {myProjects.length}
                  </span>
                </TabsTrigger>
                <TabsTrigger value="contributed" className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                  Contribuyendo
                  <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                    {contributedProjects.length}
                  </span>
                </TabsTrigger>
              </TabsList>

          <TabsContent value="all">
            {!projects?.length ? (
              <div className="text-center text-muted-foreground py-8">
                No hay proyectos. ¡Crea uno para comenzar!
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
            {!myProjects.length ? (
              <div className="text-center text-muted-foreground py-8">
                Aún no has creado ningún proyecto.
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
            {!contributedProjects.length ? (
              <div className="text-center text-muted-foreground py-8">
                Aún no has contribuido a ningún proyecto.
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