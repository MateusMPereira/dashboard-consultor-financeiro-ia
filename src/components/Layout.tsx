import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error("Erro ao sair");
    } else {
      toast.success("Logout realizado com sucesso");
      // Usa window.location para garantir que funciona na VPS com hash routing
      window.location.href = "/#/auth";
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="border-b bg-card shadow-sm">
            <div className="container mx-auto px-6 py-4 flex items-center justify-between md:justify-end gap-4">
              <div className="md:hidden">
                <SidebarTrigger />
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Sair
              </Button>
            </div>
          </header>
          <main className="h-[calc(100vh-4rem)] overflow-y-auto bg-zinc-100/40 dark:bg-zinc-800/40">
            <div className="p-4 sm:p-6">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
