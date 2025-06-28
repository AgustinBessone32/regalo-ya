import { Link } from "wouter";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CalendarIcon, MapPinIcon, Share2, Copy, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import type { Project } from "@db/schema";
import { CountdownTimer } from "./CountdownTimer";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

type ProjectCardProps = {
  project: Project;
};

export default function ProjectCard({ project }: ProjectCardProps) {
  const currentAmount = project.current_amount ?? 0;
  const progress = (currentAmount / (project.target_amount || 1)) * 100;
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const { toast } = useToast();
  
  const projectUrl = `${window.location.origin}/projects/${project.id}`;
  
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(projectUrl);
      toast({
        title: "¡Éxito!",
        description: "¡Enlace copiado al portapapeles!",
      });
      setIsShareModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al copiar el enlace",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappMessage = `${project.title}%0A${project.description}%0A${projectUrl}`;
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
    setIsShareModalOpen(false);
  };

  return (
    <Card className="h-full flex flex-col transition-all duration-300 hover:shadow-lg hover:scale-105 bg-white/90 backdrop-blur-sm border border-purple-100">
      <CardHeader className="pb-3">
        <CardTitle className="line-clamp-1 text-lg font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          {project.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {project.image_url && project.image_url.trim() !== '' && (
          <div className="relative w-full aspect-video mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 shadow-sm">
            <img
              src={project.image_url}
              alt={project.title}
              className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
              loading="lazy"
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                img.style.display = 'none';
              }}
            />
          </div>
        )}

        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
          {project.description}
        </p>

        {project.event_date && (
          <div className="space-y-1 mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarIcon className="h-4 w-4" />
              <span>{format(new Date(project.event_date), "PPP", { locale: es })}</span>
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

        <div className="space-y-3">
          <div className="relative">
            <Progress value={progress} className="h-3 bg-gray-200" />
            <div className="absolute inset-0 h-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 opacity-90" 
                 style={{ width: `${Math.min(progress, 100)}%` }} />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 font-medium">
              ${currentAmount} recaudados
            </span>
            {project.target_amount && (
              <span className="font-semibold text-purple-600">
                Meta: ${project.target_amount}
              </span>
            )}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-600">
              {project.contribution_count || 0} pagos
            </span>
            <span className="text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 px-2 py-1 rounded-full">
              {Math.round(progress)}% completado
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between gap-2 pt-4">
        <Button 
          className="w-full sm:flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 shadow-sm"
          asChild
        >
          <Link href={`/projects/${project.id}`}>
            Ver Proyecto
          </Link>
        </Button>

        <Dialog open={isShareModalOpen} onOpenChange={setIsShareModalOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2">
              <Share2 className="h-4 w-4" />
              <span className="sm:inline">Compartir</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Compartir Proyecto</DialogTitle>
              <DialogDescription>
                Comparte este proyecto con otras personas
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600 flex-1 truncate">
                  {projectUrl}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1 gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar enlace
                </Button>
                <Button
                  variant="outline"
                  onClick={handleWhatsAppShare}
                  className="flex-1 gap-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
}