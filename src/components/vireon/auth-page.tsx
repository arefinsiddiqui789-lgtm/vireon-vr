"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Shield,
  Zap,
  Brain,
} from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

type AuthView = "login" | "signup" | "verify-sent" | "verify-success" | "verify-failed";

export function AuthPage() {
  const [view, setView] = useState<AuthView>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [verifyPath, setVerifyPath] = useState("");
  const [verifyError, setVerifyError] = useState("");
  const [signupEmail, setSignupEmail] = useState("");

  // Post-login splash state
  const [showSplash, setShowSplash] = useState(false);

  // Login form
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form
  const [signupName, setSignupName] = useState("");
  const [signupEmailInput, setSignupEmailInput] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");

  // Auto-redirect after splash animation
  useEffect(() => {
    if (!showSplash) return;
    const timer = setTimeout(() => {
      window.location.reload();
    }, 2800);
    return () => clearTimeout(timer);
  }, [showSplash]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
      });

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Welcome back!");
        setShowSplash(true);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();

    if (!signupName || !signupEmailInput || !signupPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (signupPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: signupName,
          email: signupEmailInput,
          password: signupPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Signup failed");
        return;
      }

      setSignupEmail(signupEmailInput.toLowerCase());
      setVerifyPath(data.verifyPath);
      setView("verify-sent");
      toast.success("Account created! Check your email.");
    } catch {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleVerifyClick() {
    if (!verifyPath) return;
    setIsLoading(true);
    try {
      const res = await fetch(verifyPath);
      const data = await res.json();
      if (data.success) {
        toast.success("Email verified successfully!");
        setView("verify-success");
      } else {
        setVerifyError(data.reason || "unknown");
        setView("verify-failed");
      }
    } catch {
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      {/* ===== POST-LOGIN SPLASH SCREEN ===== */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
        )}
      </AnimatePresence>

      {/* ===== AUTH PAGE ===== */}
      <div className="min-h-screen flex bg-background">
        {/* ===== LEFT: Branding Panel ===== */}
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/5 dark:to-transparent" />
          <div className="absolute inset-0 grid-pattern" />

          {/* Decorative orbs */}
          <div className="absolute top-1/4 -left-20 w-64 h-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="absolute bottom-1/4 -right-10 w-48 h-48 rounded-full bg-primary/8 blur-3xl" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Logo */}
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-xl shadow-primary/30">
                  <Image
                    src="/logo.png"
                    alt="Vireon Logo"
                    width={36}
                    height={36}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground">Vireon</h1>
                  <p className="text-sm text-muted-foreground">CSE Productivity Hub</p>
                </div>
              </div>

              <h2 className="text-4xl xl:text-5xl font-extrabold leading-tight mb-6">
                Your CSE
                <br />
                <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Productivity
                </span>
                <br />
                Command Center
              </h2>

              <p className="text-lg text-muted-foreground mb-10 max-w-md">
                Study smarter, code better, stay fit — all in one place built for Computer Science students.
              </p>

              {/* Feature highlights */}
              <div className="space-y-4">
                {[
                  { icon: <Brain size={20} />, text: "AI-Powered Study Planning" },
                  { icon: <Zap size={20} />, text: "Code Compiler Built In" },
                  { icon: <Shield size={20} />, text: "Track Goals & Fitness" },
                ].map((feature) => (
                  <div key={feature.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {feature.icon}
                    </div>
                    <span className="text-sm font-medium text-foreground/70">
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ===== RIGHT: Auth Form ===== */}
        <div className="flex-1 flex items-center justify-center p-6 md:p-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            {/* Mobile logo */}
            <div className="flex items-center gap-3 mb-8 lg:hidden">
              <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20">
                <Image
                  src="/logo.png"
                  alt="Vireon Logo"
                  width={28}
                  height={28}
                  className="object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Vireon</h1>
                <p className="text-xs text-muted-foreground">CSE Productivity Hub</p>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {/* ===== LOGIN VIEW ===== */}
              {view === "login" && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Welcome back
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Sign in to continue your productivity journey
                    </p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-5">
                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="login-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="login-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="pl-10 pr-10 h-11"
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Sign In
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Switch to signup */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Don&apos;t have an account?{" "}
                      <button
                        onClick={() => setView("signup")}
                        className="text-primary font-semibold hover:underline"
                      >
                        Create one
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ===== SIGNUP VIEW ===== */}
              {view === "signup" && (
                <motion.div
                  key="signup"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold text-foreground mb-2">
                      Create your account
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Join Vireon and boost your productivity
                    </p>
                  </div>

                  <form onSubmit={handleSignup} className="space-y-4">
                    {/* Name */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-name" className="text-sm font-medium">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="signup-name"
                          type="text"
                          placeholder="Arefin Siddiqui"
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="name"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-email" className="text-sm font-medium">
                        Email
                      </Label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="signup-email"
                          type="email"
                          placeholder="you@example.com"
                          value={signupEmailInput}
                          onChange={(e) => setSignupEmailInput(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="email"
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-password" className="text-sm font-medium">
                        Password
                      </Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="signup-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Min 6 characters"
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          className="pl-10 pr-10 h-11"
                          autoComplete="new-password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm" className="text-sm font-medium">
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" />
                        <Input
                          id="signup-confirm"
                          type={showPassword ? "text" : "password"}
                          placeholder="Re-enter your password"
                          value={signupConfirmPassword}
                          onChange={(e) => setSignupConfirmPassword(e.target.value)}
                          className="pl-10 h-11"
                          autoComplete="new-password"
                        />
                      </div>
                    </div>

                    {/* Submit */}
                    <Button
                      type="submit"
                      className="w-full h-11 text-sm font-semibold gap-2"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <>
                          Create Account
                          <ArrowRight size={16} />
                        </>
                      )}
                    </Button>
                  </form>

                  {/* Switch to login */}
                  <div className="mt-6 text-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{" "}
                      <button
                        onClick={() => setView("login")}
                        className="text-primary font-semibold hover:underline"
                      >
                        Sign in
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}

              {/* ===== VERIFICATION SENT VIEW ===== */}
              {view === "verify-sent" && (
                <motion.div
                  key="verify-sent"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                    <Mail size={28} className="text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Check your email
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    We&apos;ve sent a verification link to
                  </p>
                  <p className="text-sm font-semibold text-foreground mb-6">
                    {signupEmail}
                  </p>
                  <p className="text-xs text-muted-foreground mb-8">
                    Click the link in your email to verify your account.
                    The link expires in 24 hours.
                  </p>

                  {/* Demo verify button (in production, user would click email link) */}
                  {verifyPath && (
                    <Button
                      onClick={handleVerifyClick}
                      className="w-full h-11 text-sm font-semibold gap-2 mb-4"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <CheckCircle2 size={16} />
                      )}
                      Verify My Email
                    </Button>
                  )}

                  <Button
                    variant="outline"
                    onClick={() => setView("login")}
                    className="w-full h-11 text-sm font-medium"
                  >
                    Back to Sign In
                  </Button>
                </motion.div>
              )}

              {/* ===== VERIFY SUCCESS VIEW ===== */}
              {view === "verify-success" && (
                <motion.div
                  key="verify-success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={28} className="text-emerald-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Email Verified!
                  </h2>
                  <p className="text-sm text-muted-foreground mb-8">
                    Your email has been verified successfully. You can now sign in to your account.
                  </p>

                  <Button
                    onClick={() => setView("login")}
                    className="w-full h-11 text-sm font-semibold gap-2"
                  >
                    Sign In Now
                    <ArrowRight size={16} />
                  </Button>
                </motion.div>
              )}

              {/* ===== VERIFY FAILED VIEW ===== */}
              {view === "verify-failed" && (
                <motion.div
                  key="verify-failed"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-2xl bg-destructive/10 flex items-center justify-center mx-auto mb-6">
                    <AlertCircle size={28} className="text-destructive" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Verification Failed
                  </h2>
                  <p className="text-sm text-muted-foreground mb-2">
                    We couldn&apos;t verify your email.
                  </p>
                  <p className="text-xs text-muted-foreground/60 mb-8">
                    Reason: {verifyError || "Unknown error"}. The link may have expired or is invalid.
                  </p>

                  <div className="space-y-3">
                    <Button
                      onClick={() => setView("signup")}
                      className="w-full h-11 text-sm font-semibold"
                    >
                      Sign Up Again
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setView("login")}
                      className="w-full h-11 text-sm font-medium"
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer */}
            <div className="mt-10 text-center">
              <p className="text-xs text-muted-foreground/40">
                Built with ❤️ by Arefin Siddiqui · Dhaka, Bangladesh
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
