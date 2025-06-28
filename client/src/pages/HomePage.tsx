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
    <div className="space-y-4 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            ¡Bienvenido, {user.username}!
          </h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Gestiona tus proyectos de regalo colaborativo
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Link href="/create" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
              <Plus className="mr-2 h-4 w-4" />
              Crear Proyecto
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg p-3 sm:p-6 border border-purple-100 shadow-sm">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto">
            <TabsTrigger value="all" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
              <span>Todos</span>
              <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                {projects?.length || 0}
              </span>
            </TabsTrigger>
            <TabsTrigger value="my" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Mis Proyectos</span>
              <span className="sm:hidden">Míos</span>
              <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                {myProjects.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="contributed" className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 p-2 text-xs sm:text-sm">
              <span className="hidden sm:inline">Contribuyendo</span>
              <span className="sm:hidden">Contri.</span>
              <span className="px-1.5 sm:px-2 py-0.5 text-xs bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full">
                {contributedProjects.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            {!projects?.length ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <p className="text-sm sm:text-base">No hay proyectos. ¡Crea uno para comenzar!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my" className="mt-0">
            {!myProjects.length ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <p className="text-sm sm:text-base">Aún no has creado ningún proyecto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {myProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="contributed" className="mt-0">
            {!contributedProjects.length ? (
              <div className="text-center text-muted-foreground py-8 px-4">
                <p className="text-sm sm:text-base">Aún no has contribuido a ningún proyecto.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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