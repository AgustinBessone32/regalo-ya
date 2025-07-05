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

        <Card className="border-2 border-purple-100">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              ¡Bienvenido a RegaloYa!
            </CardTitle>
            <CardDescription className="text-gray-600">
              {activeTab === "login" 
                ? "Inicia sesión con tu cuenta existente" 
                : "Crea tu cuenta nueva para comenzar"
              }
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
              <TabsList className="grid w-full grid-cols-2 bg-gray-100 p-1 rounded-lg mb-6">
                <TabsTrigger 
                  value="login" 
                  disabled={isSubmitting}
                  className={`rounded-md transition-all duration-200 ${
                    activeTab === "login" 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <span className="font-semibold">Iniciar Sesión</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="register" 
                  disabled={isSubmitting}
                  className={`rounded-md transition-all duration-200 ${
                    activeTab === "register" 
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md" 
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  <span className="font-semibold">Registrarse</span>
                </TabsTrigger>
              </TabsList>

              {/* Indicador visual adicional */}
              <div className={`p-3 rounded-lg mb-4 border-l-4 ${
                activeTab === "login" 
                  ? "bg-blue-50 border-blue-500" 
                  : "bg-green-50 border-green-500"
              }`}>
                <p className={`text-sm font-medium ${
                  activeTab === "login" ? "text-blue-700" : "text-green-700"
                }`}>
                  {activeTab === "login" 
                    ? "🔑 Accediendo con cuenta existente" 
                    : "✨ Creando nueva cuenta"
                  }
                </p>
                <p className={`text-xs mt-1 ${
                  activeTab === "login" ? "text-blue-600" : "text-green-600"
                }`}>
                  {activeTab === "login" 
                    ? "Ya tienes una cuenta de RegaloYa" 
                    : "Primera vez usando RegaloYa"
                  }
                </p>
              </div>

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
                    className={`w-full font-semibold transition-all duration-200 ${
                      activeTab === "login"
                        ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg"
                        : "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg"
                    }`}
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
                      <>
                        🔑 Iniciar Sesión
                      </>
                    ) : (
                      <>
                        ✨ Crear Mi Cuenta
                      </>
                    )}
                  </Button>

                  {/* Mensaje de ayuda adicional */}
                  <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                      {activeTab === "login" 
                        ? "¿No tienes cuenta? Haz clic en 'Registrarse' arriba" 
                        : "¿Ya tienes cuenta? Haz clic en 'Iniciar Sesión' arriba"
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
