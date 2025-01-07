import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Sparkles } from "lucide-react";

const REACTIONS = [
  { emoji: "🎁", label: "Gift" },
  { emoji: "🎂", label: "Cake" },
  { emoji: "🎈", label: "Balloon" },
  { emoji: "🎊", label: "Confetti" },
  { emoji: "❤️", label: "Love" },
  { emoji: "🌟", label: "Star" }
];

interface Reaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface EmojiReactionProps {
  projectId: number;
  initialReactions: Reaction[];
}

export function EmojiReaction({ projectId, initialReactions }: EmojiReactionProps) {
  const [reactions, setReactions] = useState<Reaction[]>(
    initialReactions.length > 0 
      ? initialReactions 
      : REACTIONS.map(r => ({ emoji: r.emoji, count: 0, reacted: false }))
  );
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const reactionMutation = useMutation({
    mutationFn: async ({ emoji }: { emoji: string }) => {
      const response = await fetch(`/api/projects/${projectId}/react`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${projectId}`] });
      setReactions(data.reactions);
      
      toast({
        title: "Success",
        description: "Reaction added!",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  return (
    <div className="flex flex-wrap gap-2">
      <TooltipProvider>
        {reactions.map((reaction) => (
          <Tooltip key={reaction.emoji}>
            <TooltipTrigger asChild>
              <Button
                variant={reaction.reacted ? "default" : "outline"}
                size="sm"
                className="gap-1"
                onClick={() => reactionMutation.mutate({ emoji: reaction.emoji })}
              >
                <span className="text-lg">{reaction.emoji}</span>
                <span className="text-xs font-medium">{reaction.count}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{REACTIONS.find(r => r.emoji === reaction.emoji)?.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
