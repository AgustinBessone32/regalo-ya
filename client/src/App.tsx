import { Switch, Route, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import CreateProject from "./pages/CreateProject";
import { useUser } from "./hooks/use-user";
import { Button } from "./components/ui/button";

function App() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Bienvenido {user.username}!</h1>
                <Link href="/create">
                  <Button variant="default">
                    Crear Nuevo Proyecto
                  </Button>
                </Link>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-2">Comienza tu Primer Proyecto</h2>
                  <p className="text-muted-foreground mb-4">
                    Crea un nuevo proyecto para organizar regalos grupales de manera fácil y divertida.
                  </p>
                  <Link href="/create">
                    <Button variant="outline" className="w-full">
                      Crear Proyecto
                    </Button>
                  </Link>
                </Card>
              </div>
            </div>
          </Route>
          <Route path="/create" component={CreateProject} />
          <Route>
            <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
              <h1 className="text-4xl font-bold text-primary">404</h1>
              <p className="text-muted-foreground">Página no encontrada</p>
            </div>
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;