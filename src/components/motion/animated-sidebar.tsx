import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type HTMLMotionProps,
} from "motion/react";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ButtonHTMLAttributes,
  type CSSProperties,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ChevronRight, PanelLeft } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { EASE_DRAWER, EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease";
import { cn } from "@/lib/utils";

type SidebarState = "expanded" | "collapsed";
type SidebarSide = "left" | "right";
type SidebarVariant = "sidebar" | "floating" | "inset";
type SidebarCollapsible = "offcanvas" | "icon" | "none";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const AnimatedSidebarContext = createContext<{
  isMobile: boolean;
  layoutId: string;
  open: boolean;
  openMobile: boolean;
  reduce: boolean;
  setOpen: (open: boolean) => void;
  setOpenMobile: (open: boolean) => void;
  state: SidebarState;
  toggleSidebar: () => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
} | null>(null);

const AnimatedSidebarPanelContext = createContext<{
  collapsed: boolean;
  collapsible: SidebarCollapsible;
  side: SidebarSide;
} | null>(null);

export function useAnimatedSidebar() {
  const context = useContext(AnimatedSidebarContext);
  if (!context) throw new Error("useAnimatedSidebar must be used inside AnimatedSidebarProvider");
  return context;
}

export function useAnimatedSidebarPanel() {
  const context = useContext(AnimatedSidebarPanelContext);
  if (!context) throw new Error("Animated sidebar parts must be used inside AnimatedSidebar");
  return context;
}

export interface AnimatedSidebarProviderProps extends HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  openMobile?: boolean;
  defaultOpenMobile?: boolean;
  onOpenMobileChange?: (open: boolean) => void;
  style?: CSSProperties & {
    "--sidebar-width"?: string;
    "--sidebar-width-icon"?: string;
    "--sidebar-width-mobile"?: string;
  };
}

export function AnimatedSidebarProvider({
  children,
  open,
  defaultOpen,
  onOpenChange,
  openMobile,
  defaultOpenMobile = false,
  onOpenMobileChange,
  className,
  style,
  ...props
}: AnimatedSidebarProviderProps) {
  const isMobile = useIsMobile();
  const reduce = useReducedMotion() ?? false;
  const generatedId = useId();
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const [internalOpen, setInternalOpen] = useState(() => {
    if (typeof window === "undefined") return defaultOpen ?? true;
    const stored = window.localStorage.getItem("mindhubs-sidebar");
    return stored === null ? defaultOpen ?? true : stored === "true";
  });
  const [internalOpenMobile, setInternalOpenMobile] = useState(defaultOpenMobile);
  const desktopOpen = open ?? internalOpen;
  const mobileOpen = openMobile ?? internalOpenMobile;

  const setOpen = useCallback(
    (nextOpen: boolean) => {
      if (open === undefined) setInternalOpen(nextOpen);
      window.localStorage.setItem("mindhubs-sidebar", String(nextOpen));
      onOpenChange?.(nextOpen);
    },
    [onOpenChange, open],
  );

  const setOpenMobile = useCallback(
    (nextOpen: boolean) => {
      if (openMobile === undefined) setInternalOpenMobile(nextOpen);
      onOpenMobileChange?.(nextOpen);
    },
    [onOpenMobileChange, openMobile],
  );

  const toggleSidebar = useCallback(() => {
    if (isMobile) setOpenMobile(!mobileOpen);
    else setOpen(!desktopOpen);
  }, [desktopOpen, isMobile, mobileOpen, setOpen, setOpenMobile]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "b" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleSidebar]);

  return (
    <AnimatedSidebarContext.Provider
      value={{
        isMobile,
        layoutId: `${generatedId}-active`,
        open: desktopOpen,
        openMobile: mobileOpen,
        reduce,
        setOpen,
        setOpenMobile,
        state: desktopOpen ? "expanded" : "collapsed",
        toggleSidebar,
        triggerRef,
      }}
    >
      <div
        {...props}
        data-state={desktopOpen ? "expanded" : "collapsed"}
        style={{
          "--sidebar-width": "16rem",
          "--sidebar-width-icon": "4.25rem",
          "--sidebar-width-mobile": "18rem",
          ...style,
        }}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full min-w-0", className)}
      >
        {children}
      </div>
    </AnimatedSidebarContext.Provider>
  );
}

function MobileSidebar({
  ariaLabel,
  children,
  className,
  side,
}: {
  ariaLabel: string;
  children: ReactNode;
  className?: string;
  side: SidebarSide;
}) {
  const context = useAnimatedSidebar();
  const panelRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!context.openMobile) return;
    const body = document.body;
    const scrollY = window.scrollY;
    const previous = {
      left: body.style.left,
      overflow: body.style.overflow,
      position: body.style.position,
      right: body.style.right,
      top: body.style.top,
    };
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => {
      const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
      (first ?? panelRef.current)?.focus({ preventScroll: true });
    });
    return () => {
      cancelAnimationFrame(focusFrame);
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.left = previous.left;
      body.style.right = previous.right;
      body.style.overflow = previous.overflow;
      window.scrollTo(0, scrollY);
      context.triggerRef.current?.focus({ preventScroll: true });
    };
  }, [context.openMobile, context.triggerRef]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {context.openMobile ? (
        <motion.div
          key="mobile-sidebar"
          className="pointer-events-auto fixed inset-0 z-50 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: context.reduce ? 0.01 : 0.2, ease: EASE_OUT }}
        >
          <button
            type="button"
            aria-label="Fermer le menu"
            className="absolute inset-0 h-full w-full cursor-default bg-black/60"
            onClick={() => context.setOpenMobile(false)}
          />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            tabIndex={-1}
            className={cn(
              "absolute inset-y-0 flex h-dvh w-[min(18rem,88vw)] max-w-[88vw] flex-col overflow-hidden border-border bg-background shadow-2xl",
              side === "left" ? "left-0 border-r" : "right-0 border-l",
              className,
            )}
            initial={{ x: side === "left" ? "-100%" : "100%" }}
            animate={{ x: 0 }}
            exit={{ x: side === "left" ? "-100%" : "100%" }}
            transition={context.reduce ? { duration: 0.01 } : { duration: 0.36, ease: EASE_DRAWER }}
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                event.preventDefault();
                context.setOpenMobile(false);
                return;
              }
              if (event.key !== "Tab") return;
              const focusable = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []);
              if (!focusable.length) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }}
          >
            <AnimatedSidebarPanelContext.Provider value={{ collapsed: false, collapsible: "none", side }}>
              {children}
            </AnimatedSidebarPanelContext.Provider>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

export interface AnimatedSidebarProps extends Omit<HTMLMotionProps<"aside">, "children"> {
  children?: ReactNode;
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: SidebarCollapsible;
  ariaLabel?: string;
  panelClassName?: string;
}

export const AnimatedSidebar = forwardRef<HTMLElement, AnimatedSidebarProps>(function AnimatedSidebar(
  {
    side = "left",
    variant = "sidebar",
    collapsible = "icon",
    ariaLabel = "Navigation principale",
    children,
    className,
    panelClassName,
    style,
    ...props
  },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const collapsed = collapsible !== "none" && !context.open;

  if (context.isMobile) {
    return (
      <MobileSidebar ariaLabel={ariaLabel} className={panelClassName ?? className} side={side}>
        {children}
      </MobileSidebar>
    );
  }

  const width = collapsible === "offcanvas" && collapsed ? "0px" : collapsed ? "var(--sidebar-width-icon)" : "var(--sidebar-width)";

  return (
    <motion.aside
      {...props}
      ref={forwardedRef}
      initial={false}
      aria-label={ariaLabel}
      data-slot="sidebar"
      data-state={collapsed ? "collapsed" : "expanded"}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      animate={{ width }}
      transition={context.reduce ? { duration: 0.01 } : { type: "spring", stiffness: 380, damping: 35, mass: 0.75 }}
      style={style}
      className={cn(
        "group/sidebar fixed inset-y-0 z-40 hidden h-svh shrink-0 md:block will-change-[width]",
        side === "left" ? "left-0" : "right-0",
        className,
      )}
    >
      <motion.div
        initial={false}
        animate={{ opacity: collapsible === "offcanvas" && collapsed ? 0 : 1 }}
        transition={{ duration: context.reduce ? 0.01 : 0.2, ease: EASE_OUT }}
        className={cn(
          "sticky top-0 flex h-svh w-full flex-col overflow-hidden bg-sidebar",
          variant === "sidebar" && (side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border"),
          variant === "floating" && "m-2 h-[calc(100svh-1rem)] rounded-2xl border border-sidebar-border shadow-sm",
          variant === "inset" && "m-2 h-[calc(100svh-1rem)] rounded-2xl",
          collapsible === "offcanvas" && "w-[var(--sidebar-width)]",
          panelClassName,
        )}
      >
        <AnimatedSidebarPanelContext.Provider value={{ collapsed, collapsible, side }}>
          {children}
        </AnimatedSidebarPanelContext.Provider>
      </motion.div>
    </motion.aside>
  );
});

export const AnimatedSidebarInset = forwardRef<HTMLElement, HTMLAttributes<HTMLElement>>(function AnimatedSidebarInset(
  { className, style, ...props },
  ref,
) {
  const context = useAnimatedSidebar();
  const sidebarOffset = context.isMobile ? undefined : context.open ? "var(--sidebar-width)" : "var(--sidebar-width-icon)";

  return (
    <main
      ref={ref}
      data-slot="sidebar-inset"
      className={cn("relative flex min-h-svh min-w-0 flex-1 flex-col bg-background", className)}
      style={{
        ...style,
        marginLeft: sidebarOffset,
        transition: context.reduce ? "none" : "margin-left 280ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      {...props}
    />
  );
});

export const AnimatedSidebarHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarHeader(
  { className, ...props },
  ref,
) {
  return <div ref={ref} data-slot="sidebar-header" className={cn("flex shrink-0 flex-col gap-2 p-3", className)} {...props} />;
});

export const AnimatedSidebarContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} data-slot="sidebar-content" className={cn("flex min-h-0 flex-1 flex-col gap-5 overflow-auto p-3", className)} {...props} />;
});

export const AnimatedSidebarFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarFooter(
  { className, ...props },
  ref,
) {
  return <div ref={ref} data-slot="sidebar-footer" className={cn("flex shrink-0 flex-col gap-1 border-t border-sidebar-border p-3", className)} {...props} />;
});

export const AnimatedSidebarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function AnimatedSidebarTrigger(
  { className, onClick, type = "button", ...props },
  forwardedRef,
) {
  const context = useAnimatedSidebar();
  const expanded = context.isMobile ? context.openMobile : context.open;
  return (
    <button
      {...props}
      ref={(node) => {
        context.triggerRef.current = node;
        if (typeof forwardedRef === "function") forwardedRef(node);
        else if (forwardedRef) forwardedRef.current = node;
      }}
      type={type}
      aria-label={props["aria-label"] ?? "Ouvrir ou réduire la navigation"}
      aria-expanded={expanded}
      data-slot="sidebar-trigger"
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented) context.toggleSidebar();
      }}
      className={cn("inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring", className)}
    >
      <PanelLeft className="size-4" aria-hidden="true" />
    </button>
  );
});

export const AnimatedSidebarRail = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(function AnimatedSidebarRail(
  { className, ...props },
  ref,
) {
  const context = useAnimatedSidebar();
  return <button {...props} ref={ref} aria-label="Réduire ou développer la navigation" onClick={context.toggleSidebar} className={cn("absolute inset-y-0 right-0 z-20 hidden w-3 translate-x-1/2 md:block", className)} />;
});

export const AnimatedSidebarGroup = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarGroup(
  { className, ...props },
  ref,
) {
  return <div ref={ref} data-slot="sidebar-group" className={cn("relative flex w-full min-w-0 flex-col", className)} {...props} />;
});

export const AnimatedSidebarGroupLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarGroupLabel(
  { className, ...props },
  ref,
) {
  const { collapsed } = useAnimatedSidebarPanel();
  return <div ref={ref} aria-hidden={collapsed} className={cn("mb-2 h-5 overflow-hidden px-3 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground transition-opacity", collapsed ? "opacity-0" : "opacity-100", className)} {...props} />;
});

export const AnimatedSidebarGroupContent = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function AnimatedSidebarGroupContent(
  { className, ...props },
  ref,
) {
  return <div ref={ref} className={cn("w-full min-w-0", className)} {...props} />;
});

export const AnimatedSidebarMenu = forwardRef<HTMLUListElement, HTMLAttributes<HTMLUListElement>>(function AnimatedSidebarMenu(
  { className, ...props },
  ref,
) {
  return <ul ref={ref} className={cn("flex w-full min-w-0 list-none flex-col gap-1", className)} {...props} />;
});

export const AnimatedSidebarMenuItem = forwardRef<HTMLLIElement, HTMLMotionProps<"li">>(function AnimatedSidebarMenuItem(
  { className, ...props },
  ref,
) {
  return <motion.li ref={ref} layout="position" transition={SPRING_LAYOUT} className={cn("relative min-w-0", className)} {...props} />;
});

export interface AnimatedSidebarMenuButtonProps {
  children: ReactNode;
  icon?: ReactNode;
  badge?: ReactNode;
  href?: string;
  isActive?: boolean;
  ariaExpanded?: boolean;
  disabled?: boolean;
  closeOnSelect?: boolean;
  onSelect?: () => void;
  className?: string;
}

export function AnimatedSidebarMenuButton({
  children,
  icon,
  badge,
  href,
  isActive = false,
  ariaExpanded,
  disabled = false,
  closeOnSelect,
  onSelect,
  className,
}: AnimatedSidebarMenuButtonProps) {
  const context = useAnimatedSidebar();
  const panel = useAnimatedSidebarPanel();
  const textLabel = typeof children === "string" ? children : undefined;

  const select = (event: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onSelect?.();
    if (context.isMobile && (closeOnSelect ?? ariaExpanded === undefined)) context.setOpenMobile(false);
    if (ariaExpanded !== undefined && panel.collapsed && !context.isMobile) context.setOpen(true);
  };

  const content = (
    <>
      {isActive ? <motion.span layoutId={context.layoutId} transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT} className="absolute inset-0 rounded-xl bg-sidebar-accent" /> : null}
      {icon ? <span aria-hidden="true" className="relative z-10 grid size-5 shrink-0 place-items-center">{icon}</span> : null}
      <motion.span
        initial={false}
        animate={{ opacity: panel.collapsed ? 0 : 1, x: panel.collapsed ? -4 : 0 }}
        transition={context.reduce ? { duration: 0.01 } : { duration: panel.collapsed ? 0.12 : 0.2, delay: panel.collapsed ? 0 : 0.08, ease: EASE_OUT }}
        aria-hidden={panel.collapsed}
        className={cn("relative z-10 min-w-0 flex-1 truncate", panel.collapsed && "pointer-events-none")}
      >
        {children}
      </motion.span>
      {badge && !panel.collapsed ? <span className="relative z-10 shrink-0 text-xs text-muted-foreground">{badge}</span> : null}
      {ariaExpanded !== undefined ? <motion.span initial={false} animate={{ opacity: panel.collapsed ? 0 : 1, rotate: ariaExpanded ? 90 : 0 }} transition={context.reduce ? { duration: 0 } : SPRING_LAYOUT} className="relative z-10 grid size-4 shrink-0 place-items-center text-muted-foreground"><ChevronRight className="size-3.5" aria-hidden="true" /></motion.span> : null}
    </>
  );

  const interactiveClassName = cn(
    "relative flex min-h-10 w-full min-w-0 items-center gap-2.5 overflow-hidden rounded-xl px-3 text-left text-sm font-medium outline-none",
    "text-muted-foreground transition-colors hover:text-foreground focus-visible:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring",
    isActive && "text-foreground",
    disabled && "cursor-not-allowed opacity-40",
    panel.collapsed && "justify-center px-2",
    className,
  );

  const commonProps = {
    "aria-current": isActive ? ("page" as const) : undefined,
    "aria-expanded": ariaExpanded,
    "aria-label": panel.collapsed ? textLabel : undefined,
    title: panel.collapsed ? textLabel : undefined,
    "aria-disabled": disabled || undefined,
    tabIndex: disabled ? -1 : undefined,
    onClick: select,
    onPointerDown: undefined,
    className: interactiveClassName,
  };

  return href ? (
    <motion.div whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }} transition={SPRING_PRESS}>
      <Link to={href} {...commonProps}>{content}</Link>
    </motion.div>
  ) : (
    <motion.button type="button" disabled={disabled} whileTap={context.reduce || disabled ? undefined : { scale: 0.98 }} transition={SPRING_PRESS} {...commonProps}>{content}</motion.button>
  );
}
