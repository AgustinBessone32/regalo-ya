import { Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonProps {
  title: string;
  description?: string;
  url: string;
}

export function ShareButton({ title, description, url }: ShareButtonProps) {
  const { toast } = useToast();

  const shareUrl = encodeURIComponent(url);
  const shareTitle = encodeURIComponent(title);
  const shareDescription = encodeURIComponent(description || '');

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to share",
          });
        }
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(url);
        toast({
          title: "Success",
          description: "Link copied to clipboard!",
        });
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to copy link",
        });
      }
    }
  };

  const openShareWindow = (baseUrl: string) => {
    const width = 550;
    const height = 400;
    const left = (window.screen.width - width) / 2;
    const top = (window.screen.height - height) / 2;
    const windowFeatures = `toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,width=${width},height=${height},top=${top},left=${left}`;
    window.open(baseUrl, '_blank', windowFeatures);
  };

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={handleShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => openShareWindow(`https://twitter.com/intent/tweet?text=${shareTitle}&url=${shareUrl}`)}
      >
        <Twitter className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={() => openShareWindow(`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`)}
      >
        <Facebook className="h-4 w-4" />
      </Button>
    </div>
  );
}
