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

export default function Home() {
  const { activeSection } = useVireonStore();
  const { data: session, status } = useSession();
  const [appReady, setAppReady] = useState(false);

  const sectionComponents: Record<string, React.ReactNode> = {
    dashboard: <DashboardSection />,
    study: <StudyPlannerSection />,
    goals: <DailyGoalsSection />,
    gym: <GymRoutineSection />,
    compiler: <CodeCompilerSection />,
    helper: <SmartHelperSection />,
    overview: <OverviewSection />,
  };

  // When session becomes authenticated, allow the app to fade in
  useEffect(() => {
    if (status === "authenticated" && session) {
      const timer = setTimeout(() => setAppReady(true), 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [status, session]);

  // Show loading while checking auth
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

  // Not authenticated — show auth page
  if (status === "unauthenticated" || !session) {
    return <AuthPage />;
  }

  // Authenticated — show main app with fade-in
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: appReady ? 1 : 0 }}
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
