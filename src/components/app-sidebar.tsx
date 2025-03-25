
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  BookOpen, 
  ChevronLeft, 
  ChevronRight, 
  Home,
  BarChart2,
  BookMarked,
  Bookmark,
  Search,
  Settings,
  User,
  Menu,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";
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
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Badge } from "@/components/ui/badge";

const mainMenuItems = [
  {
    title: "Dashboard",
    icon: Home,
    href: "/dashboard",
  },
  {
    title: "My Progress",
    icon: BarChart2,
    href: "/progress",
  },
  {
    title: "Bible Study",
    icon: BookOpen,
    href: "/study",
  },
  {
    title: "Custom Quiz",
    icon: FileText,
    href: "/custom-quiz",
  },
  {
    title: "Bookmarks",
    icon: Bookmark,
    href: "/bookmarks",
  },
  {
    title: "Search",
    icon: Search,
    href: "/search",
  },
];

const userMenuItems = [
  {
    title: "Profile",
    icon: User,
    href: "/profile",
  },
  {
    title: "Settings",
    icon: Settings,
    href: "/settings",
  },
];

function SidebarMobileContent() {
  const location = useLocation();
  
  return (
    <div className="p-4 h-full">
      <div className="flex items-center gap-2 mb-6">
        <BookMarked className="h-6 w-6 text-primary" />
        <span className="font-semibold text-lg tracking-tight">Biblico</span>
      </div>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Main Menu</h3>
          <div className="space-y-1">
            {mainMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md font-medium transition-all",
                  location.pathname === item.href ? "bg-accent/10 text-primary" : "text-foreground/80 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                )} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">User</h3>
          <div className="space-y-1">
            {userMenuItems.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 p-2 rounded-md font-medium transition-all",
                  location.pathname === item.href ? "bg-accent/10 text-primary" : "text-foreground/80 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5",
                  location.pathname === item.href ? "text-primary" : "text-muted-foreground"
                )} />
                <span>{item.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-8 left-4 right-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Samuel D.</span>
            <Badge variant="secondary" className="text-xs mt-1 py-0 px-2">Premium</Badge>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileMenuTrigger() {
  const isMobile = useIsMobile();
  const { openMobile, setOpenMobile } = useSidebar();
  
  if (!isMobile) return null;
  
  return (
    <Drawer open={openMobile} onOpenChange={setOpenMobile}>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-50">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>
      </DrawerTrigger>
      <DrawerContent className="p-0">
        <div className="h-[80vh] overflow-y-auto">
          <SidebarMobileContent />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  if (isMobile) return null;

  return (
    <Sidebar className={cn("transition-all duration-300", collapsed ? "w-20" : "w-64")}>
      <SidebarHeader className="px-4 py-6 flex items-center justify-between">
        <div className={cn("flex items-center gap-2 transition-all", 
          collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100")}>
          <BookMarked className="h-6 w-6 text-primary" />
          <span className="font-semibold text-lg tracking-tight">Biblico</span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-accent/10 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "")}>
            Main Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={cn(
                      "group flex gap-3 p-2 font-medium transition-all",
                      location.pathname === item.href ? "bg-accent/10 text-primary" : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-all",
                        location.pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className={cn(
                        "transition-all",
                        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                      )}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup className="mt-6">
          <SidebarGroupLabel className={cn(collapsed ? "sr-only" : "")}>
            User
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {userMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    className={cn(
                      "group flex gap-3 p-2 font-medium transition-all",
                      location.pathname === item.href ? "bg-accent/10 text-primary" : "text-foreground/80 hover:text-foreground"
                    )}
                  >
                    <Link to={item.href} className="flex items-center gap-3">
                      <item.icon className={cn(
                        "h-5 w-5 transition-all",
                        location.pathname === item.href ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                      )} />
                      <span className={cn(
                        "transition-all",
                        collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                      )}>
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <div className={cn(
          "flex items-center gap-3 transition-all",
          collapsed ? "justify-center" : "justify-start"
        )}>
          <div className="h-8 w-8 rounded-full bg-primary/20 text-primary flex items-center justify-center">
            <User className="h-4 w-4" />
          </div>
          <div className={cn(
            "flex flex-col transition-all",
            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
          )}>
            <span className="text-sm font-medium">Samuel D.</span>
            <Badge variant="secondary" className="text-xs mt-1 py-0 px-2">Premium</Badge>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
