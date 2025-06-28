import { Copy, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const { toast } = useToast();

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({
        title: "¡Éxito!",
        description: "¡Enlace copiado al portapapeles!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Error al copiar el enlace",
      });
    }
  };

  const handleWhatsAppShare = () => {
    const whatsappMessage = `${title}%0A${description ? description + '%0A' : ''}${url}`;
    window.open(`https://wa.me/?text=${whatsappMessage}`, '_blank');
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleCopyLink}
      >
        <Copy className="h-4 w-4" />
        Copiar enlace
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleWhatsAppShare}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
    </div>
  );
}