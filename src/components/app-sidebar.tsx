
import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  BarChart2, 
  Home, 
  Layers, 
  BookText,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar-trigger";

// Export the SidebarTrigger as MobileMenuTrigger to fix the import error
export const MobileMenuTrigger = SidebarTrigger;

export function AppSidebar() {
  const location = useLocation();
  const { openMobile, setOpenMobile } = useSidebar();
  
  const closeSidebar = () => {
    setOpenMobile(false);
  };
  
  const navigationItems = [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: Home
    },
    {
      title: "Progress",
      href: "/progress",
      icon: BarChart2
    },
    {
      title: "Study",
      href: "/study",
      icon: Layers
    },
    {
      title: "Bible Study",
      href: "/bible-study",
      icon: BookOpen
    },
    {
      title: "Custom Quiz",
      href: "/custom-quiz",
      icon: BookText
    },
    {
      title: "Mobile AR",
      href: "/mobile-ar",
      icon: Smartphone
    }
  ];
  
  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden",
          openMobile ? "block" : "hidden"
        )}
        onClick={closeSidebar}
      />
      
      <Sidebar
        className={cn(
          "fixed z-50 h-screen transition-transform duration-300 lg:static lg:z-0",
          openMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2">
            <BookText className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">Bible App</span>
          </div>
        </SidebarHeader>
        
        <SidebarContent className="px-2">
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.href}
                        className={cn(
                          "flex items-center gap-3",
                          location.pathname === item.href && "bg-accent text-accent-foreground"
                        )}
                        onClick={closeSidebar}
                      >
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        
        <SidebarFooter />
      </Sidebar>
    </>
  );
}
