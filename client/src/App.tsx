import { Switch, Route } from "wouter";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import { useUser } from "./hooks/use-user";

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
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/create" component={CreateProject} />
          <Route path="/projects/:id" component={ProjectPage} />
          <Route>
            {() => (
              <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
                <h1 className="text-4xl font-bold text-primary">404</h1>
                <p className="text-muted-foreground">Page not found</p>
              </div>
            )}
          </Route>
        </Switch>
      </main>
    </div>
  );
}

export default App;