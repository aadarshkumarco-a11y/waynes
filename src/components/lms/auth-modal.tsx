"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GraduationCap, Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowLeft, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLms } from "@/lib/store";
import { toast } from "sonner";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
const signupSchema = z.object({
  name: z.string().min(2, "Enter your name"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Min 6 characters"),
});
const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

export function AuthModal() {
  const { authOpen, authMode, setAuthOpen, login, signup, loginWithGoogle, resetPassword, enterAdminDemo, enterStudentDemo } =
    useLms();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const signupForm = useForm<SignupValues>({ resolver: zodResolver(signupSchema), defaultValues: { name: "", email: "", password: "" } });
  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const close = () => setAuthOpen(false);

  const onLogin = (v: LoginValues) => {
    setLoading(true);
    setTimeout(() => {
      const res = login(v.email, v.password);
      setLoading(false);
      if (res.ok) toast.success("Welcome back!");
      else toast.error(res.message);
    }, 400);
  };
  const onSignup = (v: SignupValues) => {
    setLoading(true);
    setTimeout(() => {
      const res = signup(v.name, v.email, v.password);
      setLoading(false);
      if (res.ok) toast.success("Account created! Welcome to Learniverse.");
      else toast.error(res.message);
    }, 500);
  };
  const onForgot = (v: ForgotValues) => {
    const res = resetPassword(v.email);
    if (res.ok) toast.success(res.message);
    else toast.error(res.message);
  };
  const onGoogle = () => {
    setLoading(true);
    setTimeout(() => {
      loginWithGoogle();
      setLoading(false);
      toast.success("Signed in with Google");
    }, 500);
  };

  return (
    <Dialog open={authOpen} onOpenChange={(o) => setAuthOpen(o)}>
      <DialogContent className="max-w-md overflow-hidden p-0">
        <div className="gradient-brand relative h-24 overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="absolute -right-8 -top-8 size-40 rounded-full bg-white/10 blur-2xl" />
          <DialogHeader className="relative px-6 pt-5 text-white">
            <DialogTitle className="flex items-center gap-2 text-lg">
              <GraduationCap className="size-5" />
              {authMode === "login" && "Welcome back"}
              {authMode === "signup" && "Create your account"}
              {authMode === "forgot" && "Reset password"}
            </DialogTitle>
            <DialogDescription className="text-white/80">
              {authMode === "login" && "Sign in to continue your learning journey"}
              {authMode === "signup" && "Join 95,000+ learners today"}
              {authMode === "forgot" && "We'll send you a reset link"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-6 pb-6 pt-2">
          <AnimatePresence mode="wait">
            {authMode === "login" && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={loginForm.handleSubmit(onLogin)}
                className="space-y-3"
              >
                <Field label="Email" icon={<Mail className="size-4" />} error={loginForm.formState.errors.email?.message}>
                  <Input type="email" placeholder="you@example.com" {...loginForm.register("email")} />
                </Field>
                <Field label="Password" icon={<Lock className="size-4" />} error={loginForm.formState.errors.password?.message}>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} placeholder="••••••••" {...loginForm.register("password")} />
                    <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent">
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <div className="flex justify-end">
                  <button type="button" onClick={() => useLms.setState({ authMode: "forgot" })} className="text-xs font-medium text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
              </motion.form>
            )}

            {authMode === "signup" && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={signupForm.handleSubmit(onSignup)}
                className="space-y-3"
              >
                <Field label="Full name" icon={<UserIcon className="size-4" />} error={signupForm.formState.errors.name?.message}>
                  <Input placeholder="Alex Sharma" {...signupForm.register("name")} />
                </Field>
                <Field label="Email" icon={<Mail className="size-4" />} error={signupForm.formState.errors.email?.message}>
                  <Input type="email" placeholder="you@example.com" {...signupForm.register("email")} />
                </Field>
                <Field label="Password" icon={<Lock className="size-4" />} error={signupForm.formState.errors.password?.message}>
                  <div className="relative">
                    <Input type={showPwd ? "text" : "password"} placeholder="••••••••" {...signupForm.register("password")} />
                    <button type="button" onClick={() => setShowPwd((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:bg-accent">
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create account"}
                </Button>
                <p className="text-center text-xs text-muted-foreground">
                  By signing up you agree to our Terms & Privacy Policy.
                </p>
              </motion.form>
            )}

            {authMode === "forgot" && (
              <motion.form
                key="forgot"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                onSubmit={forgotForm.handleSubmit(onForgot)}
                className="space-y-3"
              >
                <Field label="Email" icon={<Mail className="size-4" />} error={forgotForm.formState.errors.email?.message}>
                  <Input type="email" placeholder="you@example.com" {...forgotForm.register("email")} />
                </Field>
                <Button type="submit" className="w-full">Send reset link</Button>
                <button type="button" onClick={() => useLms.setState({ authMode: "login" })} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-primary">
                  <ArrowLeft className="size-3" /> Back to sign in
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {authMode !== "forgot" && (
            <>
              <Divider />
              <Button variant="outline" className="w-full gap-2" onClick={onGoogle} disabled={loading}>
                <GoogleIcon /> Continue with Google
              </Button>

              <div className="mt-4 rounded-xl border border-dashed bg-muted/30 p-3">
                <p className="mb-2 text-center text-xs font-medium text-muted-foreground">
                  ✨ Demo access (no signup needed)
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="secondary" onClick={enterStudentDemo} className="gap-1.5">
                    <UserIcon className="size-3.5" /> Student
                  </Button>
                  <Button size="sm" variant="secondary" onClick={enterAdminDemo} className="gap-1.5">
                    <GraduationCap className="size-3.5" /> Admin
                  </Button>
                </div>
              </div>
            </>
          )}

          {authMode === "login" && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <button onClick={() => useLms.setState({ authMode: "signup" })} className="font-semibold text-primary hover:underline">
                Sign up free
              </button>
            </p>
          )}
          {authMode === "signup" && (
            <p className="mt-4 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <button onClick={() => useLms.setState({ authMode: "login" })} className="font-semibold text-primary hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  icon,
  error,
  children,
}: {
  label: string;
  icon?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-1.5 text-xs font-medium">
        {icon && <span className="text-muted-foreground">{icon}</span>}
        {label}
      </Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-border" />
      <span className="text-xs text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export { CheckCircle2 };
