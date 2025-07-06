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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo y título simplificado */}
        <div className="text-center">
          <Gift className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-900">RegaloYa</h1>
          <p className="text-sm text-gray-600 mt-1">
            Organiza regalos colaborativos fácilmente
          </p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl text-gray-900">
              {activeTab === "login" ? "Iniciar Sesión" : "Crear Cuenta"}
            </CardTitle>
            <CardDescription className="text-gray-600 text-sm">
              {activeTab === "login" 
                ? "Ingresa a tu cuenta de RegaloYa" 
                : "Únete a RegaloYa gratis"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Tabs más simples */}
            <Tabs
              defaultValue="login"
              value={activeTab}
              onValueChange={(value) =>
                setActiveTab(value as "login" | "register")
              }
            >
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger 
                  value="login" 
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  Iniciar Sesión
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  Registrarse
                </TabsTrigger>
              </TabsList>

              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Correo Electrónico
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="ejemplo@email.com"
                            {...field}
                            disabled={isSubmitting}
                            className="h-11"
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
                        <FormLabel className="text-sm font-medium text-gray-700">
                          Contraseña
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder={activeTab === "login" ? "Ingresa tu contraseña" : "Crea una contraseña"}
                            {...field}
                            disabled={isSubmitting}
                            className="h-11"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-11 font-medium text-base"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {activeTab === "login"
                          ? "Iniciando..."
                          : "Creando cuenta..."}
                      </>
                    ) : activeTab === "login" ? (
                      "Iniciar Sesión"
                    ) : (
                      "Crear Mi Cuenta"
                    )}
                  </Button>

                  {/* Mensaje de cambio simplificado */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-gray-500">
                      {activeTab === "login" 
                        ? "¿Primera vez? Cambia a 'Registrarse'" 
                        : "¿Ya tienes cuenta? Cambia a 'Iniciar Sesión'"
                      }
                    </p>
                  </div>
                </form>
              </Form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
