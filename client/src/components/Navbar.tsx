import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Gift, LogOut, Plus, User } from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, logout } = useUser();

  return (
    <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/">
          <a className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Gift className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              RegaloYa
            </span>
          </a>
        </Link>

        <div className="flex items-center gap-3">
          <Link href="/create">
            <Button size="sm" className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0">
              <Plus className="h-4 w-4" />
              Nuevo Proyecto
            </Button>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white font-medium text-sm">
                  {user?.username?.charAt(0).toUpperCase() || <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium text-gray-700">
                {user?.username}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="gap-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}