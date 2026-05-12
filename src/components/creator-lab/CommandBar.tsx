import { useState, useEffect, useCallback } from "react";
import { Command, Search, Lightbulb, Cpu, Megaphone, Rocket, RotateCcw, Sparkles } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { useCreatorLab, type PipelineStepId } from "@/contexts/CreatorLabContext";

interface CommandBarProps {
  onNavigate: (step: PipelineStepId) => void;
}

const COMMANDS = [
  { id: "spy" as PipelineStepId, label: "Veille Marché", icon: Search, shortcut: "1" },
  { id: "sandbox" as PipelineStepId, label: "Idée Sandbox", icon: Lightbulb, shortcut: "2" },
  { id: "architect" as PipelineStepId, label: "Product Architect", icon: Cpu, shortcut: "3" },
  { id: "marketing" as PipelineStepId, label: "Marketing Co-Pilot", icon: Megaphone, shortcut: "4" },
  { id: "publish" as PipelineStepId, label: "Publier", icon: Rocket, shortcut: "5" },
];

/**
 * CommandBar
 * Palette de commandes (Ctrl+K) pour naviguer rapidement entre les modules
 * et déclencher des actions IA dans le Creator Lab.
 */
const CommandBar = ({ onNavigate }: CommandBarProps) => {
  const [open, setOpen] = useState(false);
  const { resetSession, pipelineStatus } = useCreatorLab();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "k") {
      e.preventDefault();
      setOpen((o) => !o);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSelect = (stepId: PipelineStepId) => {
    if (pipelineStatus[stepId] !== "locked") {
      onNavigate(stepId);
    }
    setOpen(false);
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-muted-foreground backdrop-blur-xl hover:bg-white/10 transition-all"
      >
        <Command size={12} />
        <span className="hidden sm:inline">Rechercher…</span>
        <kbd className="ml-2 rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-mono font-bold">⌘K</kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Naviguer, actions, modules…" />
        <CommandList>
          <CommandEmpty>Aucun résultat.</CommandEmpty>

          <CommandGroup heading="Modules">
            {COMMANDS.map((cmd) => {
              const locked = pipelineStatus[cmd.id] === "locked";
              return (
                <CommandItem
                  key={cmd.id}
                  disabled={locked}
                  onSelect={() => handleSelect(cmd.id)}
                  className={locked ? "opacity-40" : ""}
                >
                  <cmd.icon className="mr-2 h-4 w-4" />
                  <span>{cmd.label}</span>
                  <kbd className="ml-auto rounded bg-muted px-1.5 py-0.5 text-[10px] font-mono">{cmd.shortcut}</kbd>
                </CommandItem>
              );
            })}
          </CommandGroup>

          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => { resetSession(); setOpen(false); }}>
              <RotateCcw className="mr-2 h-4 w-4" />
              <span>Nouvelle session</span>
            </CommandItem>
            <CommandItem onSelect={() => { onNavigate("spy"); setOpen(false); }}>
              <Sparkles className="mr-2 h-4 w-4" />
              <span>Nouvelle idée</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
};

export default CommandBar;
