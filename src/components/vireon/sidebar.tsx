"use client";

import { useVireonStore, type ActiveSection } from "@/store/vireon-store";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  BookOpen,
  Target,
  Dumbbell,
  Code2,
  Bot,
  Sun,
  Moon,
  Menu,
  X,
  CalendarDays,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useSyncExternalStore } from "react";
import Image from "next/image";

interface NavItem {
  id: ActiveSection;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={17} />, color: "bg-blue-500/15 text-blue-400 dark:text-blue-400" },
  { id: "study", label: "Study Planner", icon: <BookOpen size={17} />, color: "bg-emerald-500/15 text-emerald-400 dark:text-emerald-400" },
  { id: "goals", label: "Daily Goals", icon: <Target size={17} />, color: "bg-teal-500/15 text-teal-400 dark:text-teal-400" },
  { id: "gym", label: "Gym Routine", icon: <Dumbbell size={17} />, color: "bg-rose-500/15 text-rose-400 dark:text-rose-400" },
  { id: "compiler", label: "Code Compiler", icon: <Code2 size={17} />, color: "bg-violet-500/15 text-violet-400 dark:text-violet-400" },
  { id: "helper", label: "Vireon Bro", icon: <Bot size={17} />, color: "bg-amber-500/15 text-amber-400 dark:text-amber-400" },
  { id: "overview", label: "Overview", icon: <CalendarDays size={17} />, color: "bg-cyan-500/15 text-cyan-400 dark:text-cyan-400" },
];

const emptySubscribe = () => () => {};

export function Sidebar() {
  const { activeSection, setActiveSection, sidebarOpen, setSidebarOpen } =
    useVireonStore();
  const { theme, setTheme } = useTheme();
  const { data: session } = useSession();
  const mounted = useSyncExternalStore(emptySubscribe, () => true, () => false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-50 md:hidden p-2.5 rounded-xl bg-card/90 backdrop-blur-sm border border-border shadow-lg hover:opacity-80 transition-opacity"
        aria-label="Toggle sidebar"
      >
        {sidebarOpen ? <X size={20} className="text-foreground" /> : <Menu size={20} className="text-foreground" />}
      </button>

      {/* Overlay for mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-[250px]",
          "bg-sidebar border-r border-sidebar-border",
          "flex flex-col",
          "transition-all duration-300 ease-in-out",
          "dark:bg-gradient-to-b dark:from-[#050b18] dark:via-[#071220] dark:to-[#091828]",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto"
        )}
      >
        {/* Ambient glow at top */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-primary/[0.04] to-transparent pointer-events-none" />
        {/* Subtle corner glow */}
        <div className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

        {/* ===== LOGO AREA ===== */}
        <div className="relative z-10 px-5 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 shrink-0">
              <Image
                src="/logo.png"
                alt="Vireon Logo"
                width={30}
                height={30}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-[17px] font-bold text-foreground leading-tight">
                Vireon
              </h1>
              <p className="text-[10px] text-muted-foreground font-medium tracking-wide">
                Productivity Hub
              </p>
            </div>
          </div>
        </div>

        {/* ===== NAVIGATION ===== */}
        <nav className="flex-1 overflow-y-auto px-3 relative z-10">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-xl text-left relative",
                    "transition-all duration-200",
                    isActive
                      ? "py-2.5 px-3"
                      : "py-2 px-3 hover:py-2.5"
                  )}
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Active background pill */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-bg"
                      className="absolute inset-0 rounded-xl dark:bg-white/[0.06] bg-primary/[0.08] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] shadow-[inset_0_1px_0_rgba(59,109,250,0.1)]"
                      transition={{ type: "spring", stiffness: 400, damping: 35 }}
                    />
                  )}

                  {/* Icon bubble */}
                  <div
                    className={cn(
                      "relative z-10 w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                      isActive
                        ? item.color
                        : "bg-transparent text-sidebar-foreground/35 group-hover:text-sidebar-foreground/60"
                    )}
                  >
                    {item.icon}
                  </div>

                  {/* Label */}
                  <span
                    className={cn(
                      "relative z-10 text-[13px] font-medium truncate transition-colors duration-200",
                      isActive
                        ? "text-foreground"
                        : "text-sidebar-foreground/45 hover:text-sidebar-foreground/80"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active dot */}
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-dot"
                      className="relative z-10 ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>

        {/* ===== BOTTOM SECTION ===== */}
        <div className="relative z-10 px-3 pb-5">
          {/* Theme toggle card */}
          <div className="rounded-xl dark:bg-white/[0.03] bg-muted/40 p-2">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium",
                "hover:bg-sidebar-accent/50 transition-all duration-200"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                "bg-amber-500/15 text-amber-400 dark:text-amber-400 dark:bg-amber-500/15",
                mounted && theme !== "dark" && "bg-indigo-500/15 text-indigo-500"
              )}>
                {mounted && theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
              </div>
              <span className="text-sidebar-foreground/60">
                {mounted && theme === "dark" ? "Light Mode" : "Dark Mode"}
              </span>
            </button>
          </div>

          {/* User info & Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium mt-2",
              "text-sidebar-foreground/40 hover:text-rose-400 hover:bg-rose-500/10 transition-all duration-200"
            )}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-rose-500/10 text-rose-400">
              <LogOut size={17} />
            </div>
            <span>Sign Out</span>
          </button>

          {/* Branding */}
          <p className="text-[10px] text-muted-foreground/25 text-center mt-3 font-medium">
            v1.0 · Built by Arefin
          </p>
        </div>
      </aside>
    </>
  );
}
