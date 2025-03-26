
import React, { createContext, useContext, ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/theme-toggle";

// Context for sidebar state management
type SidebarContextType = {
  openMobile: boolean;
  setOpenMobile: React.Dispatch<React.SetStateAction<boolean>>;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [openMobile, setOpenMobile] = useState(false);

  return (
    <SidebarContext.Provider value={{ openMobile, setOpenMobile }}>
      {children}
    </SidebarContext.Provider>
  );
}

// Base Sidebar component
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  placeUserProfileAtBottom?: boolean;
  showThemeToggle?: boolean;
}

export function Sidebar({
  className,
  placeUserProfileAtBottom = true,
  showThemeToggle = true,
  ...props
}: SidebarProps) {
  return (
    <div
      className={cn(
        "bg-sidebar-background text-sidebar-foreground flex h-full w-[260px] flex-col gap-4 border-r border-sidebar-border p-2",
        className
      )}
      {...props}
    >
      {!placeUserProfileAtBottom && <UserProfile />}
      <div className="flex-1 overflow-auto">{props.children}</div>
      {placeUserProfileAtBottom && <UserProfile />}
      {showThemeToggle && (
        <div className="flex justify-center">
          <ThemeToggle />
        </div>
      )}
    </div>
  );
}

// Sidebar header component
export function SidebarHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex items-center justify-between px-4 py-2", className)}
      {...props}
    />
  );
}

// Sidebar content component
export function SidebarContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />;
}

// Sidebar footer component
export function SidebarFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto", className)} {...props} />;
}

// Sidebar group components
export function SidebarGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-2 text-xs font-semibold text-muted-foreground",
        className
      )}
      {...props}
    />
  );
}

export function SidebarGroupContent({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1", className)} {...props} />;
}

// Sidebar menu components
export function SidebarMenu({
  className,
  ...props
}: React.HTMLAttributes<HTMLUListElement>) {
  return <ul className={cn("space-y-1", className)} {...props} />;
}

export function SidebarMenuItem({
  className,
  ...props
}: React.HTMLAttributes<HTMLLIElement>) {
  return <li className={cn("", className)} {...props} />;
}

interface SidebarMenuButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
}

export function SidebarMenuButton({
  className,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const Comp = asChild ? React.Fragment : "div";
  return (
    <Comp
      className={cn(
        "flex cursor-pointer items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent/50",
        className
      )}
      {...props}
    />
  );
}
