import { LayoutDashboard, AlertTriangle, Target, TrendingUp, Building2, Tag, Receipt } from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";

const financeMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "KPIs", url: "/kpis", icon: Target, disabled: true },
  { title: "Alertas", url: "/alertas", icon: AlertTriangle, disabled: true },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
];

const registrationMenuItems = [
  { title: "Categorias", url: "/categorias", icon: Tag },
  { title: "Fornecedores", url: "/fornecedores", icon: Building2 },
];

export function AppSidebar() {
  return (
    <Sidebar className="border-r shadow-elegant">
      <SidebarHeader className="border-b border-border/50 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <h2 className="text-base font-bold text-foreground">Gestão Financeira</h2>
            <p className="text-xs text-muted-foreground">Plataforma Analítica</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-3 py-4">
        {/* Finance Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Financeiro
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1">
              {financeMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    {item.disabled ? (
                      <span
                        className={
                          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 text-muted-foreground cursor-not-allowed"
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.title}</span>
                      </span>
                    ) : (
                      <NavLink
                        to={item.url}
                        className={({ isActive }) =>
                          isActive
                            ? "bg-gradient-primary text-gray-900 dark:text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900"
                            : "text-gray-900 dark:text-gray-900 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900 hover:bg-muted/80 transition-all duration-200 hover:translate-x-1"
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.title}</span>
                      </NavLink>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Divider */}
        <div className="my-4 border-t border-border/50" />

        {/* Registration Group */}
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cadastros
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1">
              {registrationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink
                      to={item.url}
                      className={({ isActive }) =>
                        isActive
                          ? "bg-gradient-primary text-gray-900 dark:text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900"
                          : "text-gray-900 dark:text-gray-900 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900 hover:bg-muted/80 transition-all duration-200 hover:translate-x-1"
                      }
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
