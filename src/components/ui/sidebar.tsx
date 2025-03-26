
import { cn } from "@/lib/utils";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/theme-toggle";

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
