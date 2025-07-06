import { Switch, Route, useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { AlertCircle, Loader2 } from "lucide-react";
import AuthPage from "./pages/AuthPage";
import CreateProject from "./pages/CreateProject";
import ProjectPage from "./pages/ProjectPage";
import HomePage from "./pages/HomePage";
import LandingPage from "./pages/LandingPage";
import RetailLanding from "./pages/RetailLanding";
import { useUser } from "./hooks/use-user";
import { useEffect } from "react";

function App() {
  const { user, isLoading } = useUser();
  const [, setLocation] = useLocation();

  // Redirect authenticated users away from auth page
  useEffect(() => {
    if (user && window.location.pathname === "/auth") {
      setLocation("/");
    }
  }, [user, setLocation]);

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
        <Route path="/projects/:id">
          <div className="min-h-screen bg-background">
            <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
              <ProjectPage />
            </main>
          </div>
        </Route>
        <Route path="/soluciones-retail" component={RetailLanding} />
        <Route path="/" component={LandingPage} />
        <Route component={LandingPage} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
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
