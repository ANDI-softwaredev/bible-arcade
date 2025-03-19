
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
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

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
            <span className="text-xs text-muted-foreground">Premium</span>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
