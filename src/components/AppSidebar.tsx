import { LayoutDashboard, AlertTriangle, TrendingUp, Tag, Receipt } from "lucide-react";
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
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";

const financeMenuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Alertas", url: "/alertas", icon: AlertTriangle, disabled: true },
  { title: "Lançamentos", url: "/lancamentos", icon: Receipt },
];

const registrationMenuItems = [
  { title: "Categorias", url: "/categorias", icon: Tag },
];

export function AppSidebar() {
  const { isMobile, setOpenMobile } = useSidebar();

  const handleMenuItemClick = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r shadow-elegant">
      <SidebarRail />
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
        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Financeiro
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1">
              {financeMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.disabled ? (
                    <SidebarMenuButton
                      as="span"
                      className="cursor-not-allowed text-muted-foreground"
                    >
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </SidebarMenuButton>
                  ) : (
                    <NavLink to={item.url} onClick={handleMenuItemClick}>
                      {({ isActive }) => (
                        <SidebarMenuButton
                          isActive={isActive}
                          className={
                            isActive
                              ? "bg-gradient-primary text-gray-900 dark:text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900"
                              : "text-gray-900 dark:text-gray-900 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900 hover:bg-muted/80 transition-all duration-200 hover:translate-x-1"
                          }
                        >
                          <item.icon className="h-5 w-5" />
                          <span className="text-sm">{item.title}</span>
                        </SidebarMenuButton>
                      )}
                    </NavLink>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="my-4 border-t border-border/50" />

        <SidebarGroup>
          <SidebarGroupLabel className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Cadastros
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="gap-1">
              {registrationMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink to={item.url} onClick={handleMenuItemClick}>
                    {({ isActive }) => (
                      <SidebarMenuButton
                        isActive={isActive}
                        className={
                          isActive
                            ? "bg-gradient-primary text-gray-900 dark:text-gray-900 font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900"
                            : "text-gray-900 dark:text-gray-900 hover:text-gray-900 [&_*]:text-gray-900 [&_*]:hover:text-gray-900 hover:bg-muted/80 transition-all duration-200 hover:translate-x-1"
                        }
                      >
                        <item.icon className="h-5 w-5" />
                        <span className="text-sm">{item.title}</span>
                      </SidebarMenuButton>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
