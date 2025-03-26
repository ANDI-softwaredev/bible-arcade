
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSidebar } from "@/components/ui/sidebar";

interface SidebarTriggerProps {
  className?: string;
}

export function SidebarTrigger({ className }: SidebarTriggerProps) {
  const { openMobile, setOpenMobile } = useSidebar();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={className}
      onClick={() => setOpenMobile(!openMobile)}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  );
}
