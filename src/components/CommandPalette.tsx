import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Phone, 
  BarChart3, 
  Settings, 
  User, 
  CreditCard,
  Bot,
  PhoneCall
} from "lucide-react";

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const runCommand = useCallback((command: () => void) => {
    setOpen(false);
    command();
  }, []);

  const navigationItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      shortcut: "D",
      action: () => navigate("/dashboard"),
    },
    {
      icon: Phone,
      label: "Call Logs",
      shortcut: "C",
      action: () => navigate("/dashboard/calls"),
    },
    {
      icon: BarChart3,
      label: "Analytics",
      shortcut: "A",
      action: () => navigate("/dashboard/analytics"),
    },
    {
      icon: Settings,
      label: "Settings",
      shortcut: "S",
      action: () => navigate("/dashboard/settings"),
    },
  ];

  const settingsItems = [
    {
      icon: Bot,
      label: "AI Assistant Settings",
      action: () => navigate("/dashboard/settings?tab=ai"),
    },
    {
      icon: PhoneCall,
      label: "Phone Numbers",
      action: () => navigate("/dashboard/settings?tab=phone"),
    },
    {
      icon: User,
      label: "Business Information",
      action: () => navigate("/dashboard/settings?tab=business"),
    },
    {
      icon: CreditCard,
      label: "Billing",
      action: () => navigate("/dashboard/settings?tab=billing"),
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        <CommandGroup heading="Navigation">
          {navigationItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
              {item.shortcut && (
                <kbd className="pointer-events-none ml-auto inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                  <span className="text-xs">⌘</span>{item.shortcut}
                </kbd>
              )}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandGroup heading="Settings">
          {settingsItems.map((item) => (
            <CommandItem
              key={item.label}
              onSelect={() => runCommand(item.action)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              <span>{item.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

export default CommandPalette;
