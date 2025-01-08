import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Gift } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function InvitationPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useUser();
  const invitationToken = window.location.pathname.split('/invite/')[1];

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      setLocation(`/auth?redirect=/invite/${invitationToken}`);
    }
  }, [user, invitationToken, setLocation]);

  const acceptInvitation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/projects/accept-invitation/${invitationToken}`, {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(await response.text());
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "You've been added to the project!",
      });
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Gift className="w-12 h-12 mx-auto mb-4 text-primary" />
          <CardTitle>Birthday Project Invitation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-muted-foreground">
            You've been invited to join a birthday project!
          </p>
          <Button
            className="w-full"
            onClick={() => acceptInvitation.mutate()}
            disabled={acceptInvitation.isPending}
          >
            {acceptInvitation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Accepting Invitation...
              </>
            ) : (
              "Accept Invitation"
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
