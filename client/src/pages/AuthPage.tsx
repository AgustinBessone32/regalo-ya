import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Gift, Loader2 } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useState } from "react";

const authSchema = z.object({
  email: z.string().email("Por favor, introduce un email válido"),
  password: z.string().min(1, "La contraseña es requerida"),
});

export default function AuthPage() {
  const { loginMutation, registerMutation, user } = useUser();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof authSchema>) => {
    const userData = {
      email: data.email,
      password: data.password,
    };

    if (activeTab === "login") {
      loginMutation.mutate(userData);
    } else {
      registerMutation.mutate(userData);
    }
  };

  const isSubmitting = loginMutation.isPending || registerMutation.isPending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center gap-2">
          <Gift className="h-12 w-12 text-primary" />
          <h1 className="text-2xl font-semibold text-center">RegaloYa</h1>
          <p className="text-sm text-muted-foreground text-center">
            Simplifica la organización de regalos colaborativos
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>¡Bienvenido a RegaloYa!</CardTitle>
            <CardDescription>
              Inicia sesión en tu cuenta o crea una nueva
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "login" | "register")
              }
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" disabled={isSubmitting}>
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger value="register" disabled={isSubmitting}>
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4 mt-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="tu@email.com"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contraseña</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Tu contraseña"
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {activeTab === "login"
                          ? "Iniciando Sesión..."
                          : "Creando Cuenta..."}
                      </>
                    ) : activeTab === "login" ? (
                      "Iniciar Sesión"
                    ) : (
                      "Crear Cuenta"
                    )}
                  </Button>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
