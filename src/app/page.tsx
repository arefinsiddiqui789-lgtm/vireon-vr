"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/vireon/sidebar";
import { DashboardSection } from "@/components/vireon/dashboard";
import { StudyPlannerSection } from "@/components/vireon/study-planner";
import { DailyGoalsSection } from "@/components/vireon/daily-goals";
import { GymRoutineSection } from "@/components/vireon/gym-routine";
import { CodeCompilerSection } from "@/components/vireon/code-compiler";
import { SmartHelperSection } from "@/components/vireon/smart-helper";
import { OverviewSection } from "@/components/vireon/overview";
import { Footer } from "@/components/vireon/footer";
import { AuthPage } from "@/components/vireon/auth-page";
import { useVireonStore } from "@/store/vireon-store";
import { AnimatePresence, motion } from "framer-motion";
import { useSession } from "next-auth/react";
import Image from "next/image";

const LOGIN_EVENT = "vireon:login-success";

export function signalJustLoggedIn() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(LOGIN_EVENT));
  }
}

export default function Home() {
  const { activeSection } = useVireonStore();
  const { data: session, status } = useSession();
  const [showSplash, setShowSplash] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    study: <StudyPlannerSection />,
    goals: <DailyGoalsSection />,
    gym: <GymRoutineSection />,
    compiler: <CodeCompilerSection />,
    helper: <SmartHelperSection />,
    overview: <OverviewSection />,
  };

  // Listen for login success event (from auth-page)
  useEffect(() => {
    const handleLogin = () => {
      setSplashDone(false);
      setShowSplash(true);
    };
    window.addEventListener(LOGIN_EVENT, handleLogin);
    return () => window.removeEventListener(LOGIN_EVENT, handleLogin);
  }, []);

  // Splash auto-advance to app after animation
  useEffect(() => {
    if (!showSplash || splashDone) return;
    const timer = setTimeout(() => {
      setSplashDone(true);
    }, 2600);
    return () => clearTimeout(timer);
  }, [showSplash, splashDone]);

  // ===== Loading =====
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <div className="w-12 h-12 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30">
            <Image
              src="/logo.png"
              alt="Vireon"
              width={32}
              height={32}
              className="object-contain"
            />
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce [animation-delay:-0.15s]" />
            <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
          </div>
        </motion.div>
      </div>
    );
  }

  // ===== Not authenticated =====
  if (status === "unauthenticated" || !session) {
    return <AuthPage />;
  }

  // ===== Splash (post-login animation) =====
  if (showSplash && !splashDone) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
      >
        {/* Ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full bg-primary/[0.07] blur-[100px] pointer-events-none" />

        {/* Logo animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="relative mb-6"
        >
          {/* Outer ring pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.4, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
            className="absolute inset-0 rounded-3xl border-2 border-primary/30"
          />
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1.6, opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut", delay: 0.5 }}
            className="absolute inset-0 rounded-3xl border border-primary/15"
          />

          {/* Logo container */}
          <div className="w-20 h-20 rounded-3xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-2xl shadow-primary/40">
            <Image
              src="/logo.png"
              alt="Vireon Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </motion.div>

        {/* Brand name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Vireon
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Productivity Hub
          </p>
        </motion.div>

        {/* Welcome message */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="text-muted-foreground/60 text-sm mt-6"
        >
          Preparing your workspace...
        </motion.p>

        {/* Loading dots */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1 }}
          className="flex items-center gap-1.5 mt-4"
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-primary"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    );
  }

  // ===== Main App =====
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen flex flex-col bg-background"
    >
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 overflow-auto bg-background">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="min-h-[calc(100vh-60px)]"
            >
              {sectionComponents[activeSection]}
            </motion.div>
          </AnimatePresence>
          <Footer />
        </main>
      </div>
    </motion.div>
  );
}
