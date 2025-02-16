import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Gift, LogOut, Plus } from "lucide-react";
import { useUser } from "@/hooks/use-user";

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b bg-card">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 text-xl font-semibold text-primary">
            <Gift className="h-6 w-6" />
            <span>RegaloYa</span>
          </a>
        </Link>

        <div className="flex items-center gap-4">
          <Link href="/create">
            <Button variant="outline" size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {user?.username}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}