import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type User = {
  id: number;
  email: string;
};

type RequestResult =
  | {
      ok: true;
      user?: User;
    }
  | {
      ok: false;
      message: string;
    };

async function handleRequest(
  url: string,
  method: string,
  body?: { email: string; password: string }
): Promise<RequestResult> {
  try {
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      credentials: "include",
    });

    if (!response.ok) {
      if (response.status >= 500) {
        return { ok: false, message: response.statusText };
      }

      const responseText = await response.text();

      // Try to parse as JSON to extract error message
      try {
        const errorData = JSON.parse(responseText);
        return { ok: false, message: errorData.error || responseText };
      } catch {
        // If not JSON, return the text as is
        return { ok: false, message: responseText };
      }
    }

    const data = await response.json();
    return { ok: true, user: data };
  } catch (e: any) {
    return { ok: false, message: e.toString() };
  }
}

export function useUser() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<User | null>({
    queryKey: ["/api/user"],
    queryFn: async () => {
      try {
        const response = await fetch("/api/user", {
          credentials: "include",
        });

        if (!response.ok) {
          if (response.status === 401) {
            return null;
          }
          throw new Error(await response.text());
        }

        return response.json();
      } catch (error) {
        console.error("Error fetching user:", error);
        return null;
      }
    },
    staleTime: 0,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: (userData: { email: string; password: string }) =>
      handleRequest("/api/login", "POST", userData),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "¡Éxito!",
          description: "Sesión iniciada correctamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: (userData: { email: string; password: string }) =>
      handleRequest("/api/register", "POST", userData),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "¡Éxito!",
          description: "Registro completado correctamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => handleRequest("/api/logout", "POST"),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        toast({
          title: "¡Éxito!",
          description: "Sesión cerrada correctamente",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: result.message,
        });
      }
    },
  });

  return {
    user,
    isLoading,
    error,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    loginMutation,
    registerMutation,
    logoutMutation,
  };
}
