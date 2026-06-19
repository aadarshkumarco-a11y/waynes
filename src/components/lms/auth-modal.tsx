"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Mail,
  Lock as LockIcon,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowLeft,
  Terminal,
  Shield,
  Fingerprint,
} from "lucide-react";
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
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Min 6 characters"),
});
const signupSchema = z.object({
  name: z.string().min(2, "Enter a handle"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Min 6 characters"),
});
const forgotSchema = z.object({
  email: z.string().email("Invalid email format"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

type AuthMode = "login" | "signup" | "forgot";

const MODE_META: Record<AuthMode, { title: string; sub: string }> = {
  login: { title: "AUTHENTICATE", sub: "Validate credentials to access the system" },
  signup: { title: "CREATE ACCESS", sub: "Provision a new operator account" },
  forgot: { title: "RESET ACCESS", sub: "Transmit a recovery payload to your inbox" },
};

export function AuthModal() {
  const {
    authOpen,
    authMode,
    setAuthOpen,
    login,
    signup,
    loginWithGoogle,
    resetPassword,
    enterStudentDemo,
  } = useLms();
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });
  const forgotForm = useForm<ForgotValues>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  const setMode = (m: AuthMode) => useLms.setState({ authMode: m });

  const onLogin = (v: LoginValues) => {
    setLoading(true);
    setTimeout(() => {
      const res = login(v.email, v.password);
      setLoading(false);
      if (res.ok) toast.success("Access granted. Welcome back.");
      else toast.error(res.message);
    }, 400);
  };
  const onSignup = (v: SignupValues) => {
    setLoading(true);
    setTimeout(() => {
      const res = signup(v.name, v.email, v.password);
      setLoading(false);
      if (res.ok) toast.success("Account provisioned. Welcome to waynes.");
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
      toast.success("OAuth handshake complete");
    }, 500);
  };

  const meta = MODE_META[authMode];

  return (
    <Dialog open={authOpen} onOpenChange={(o) => setAuthOpen(o)}>
      <DialogContent className="terminal-window scanlines relative max-w-md overflow-hidden p-0">
        {/* Terminal title bar */}
        <div className="flex items-center justify-between border-b border-primary/30 bg-background/80 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="size-3 rounded-full bg-destructive/80" />
            <span className="size-3 rounded-full bg-warning/80" />
            <span className="size-3 rounded-full bg-primary/90 glow-green" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            waynes@auth: <span className="text-primary/80">~</span>
            <span className="text-muted-foreground/60">/</span>
            {authMode}
          </span>
          <span className="font-mono text-xs text-muted-foreground/60">ssh</span>
        </div>

        {/* Header */}
        <DialogHeader className="relative px-6 pt-6">
          <DialogTitle className="flex items-center gap-2 font-mono text-xl font-bold tracking-tight text-primary text-glow-green">
            <Terminal className="size-5" />
            {meta.title}
          </DialogTitle>
          <DialogDescription className="font-mono text-xs text-muted-foreground">
            {"> "}
            {meta.sub}
            <span className="cursor-blink text-primary" />
          </DialogDescription>
        </DialogHeader>

        <div className="relative px-6 pb-6 pt-3">
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
                <Field
                  label="email"
                  icon={<Mail className="size-4" />}
                  error={loginForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="anon@protonmail.com"
                    {...loginForm.register("email")}
                    className="rounded-none border-border/50 bg-background/60 font-mono text-sm lowercase focus-visible:border-primary"
                  />
                </Field>
                <Field
                  label="password"
                  icon={<LockIcon className="size-4" />}
                  error={loginForm.formState.errors.password?.message}
                >
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      {...loginForm.register("password")}
                      className="rounded-none border-border/50 bg-background/60 pr-9 font-mono text-sm focus-visible:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-primary"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode("forgot")}
                    className="font-mono text-xs text-primary hover:underline"
                  >
                    {"> "}forgot_password
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-1.5 rounded-none font-mono text-sm uppercase tracking-wider glow-green"
                >
                  {loading ? "authenticating..." : "AUTHENTICATE"}
                  <Fingerprint className="size-4" />
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
                <Field
                  label="handle"
                  icon={<UserIcon className="size-4" />}
                  error={signupForm.formState.errors.name?.message}
                >
                  <Input
                    placeholder="R0otK1t"
                    {...signupForm.register("name")}
                    className="rounded-none border-border/50 bg-background/60 font-mono text-sm focus-visible:border-primary"
                  />
                </Field>
                <Field
                  label="email"
                  icon={<Mail className="size-4" />}
                  error={signupForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="anon@protonmail.com"
                    {...signupForm.register("email")}
                    className="rounded-none border-border/50 bg-background/60 font-mono text-sm lowercase focus-visible:border-primary"
                  />
                </Field>
                <Field
                  label="password"
                  icon={<LockIcon className="size-4" />}
                  error={signupForm.formState.errors.password?.message}
                >
                  <div className="relative">
                    <Input
                      type={showPwd ? "text" : "password"}
                      placeholder="••••••••"
                      {...signupForm.register("password")}
                      className="rounded-none border-border/50 bg-background/60 pr-9 font-mono text-sm focus-visible:border-primary"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => !s)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-primary"
                      aria-label={showPwd ? "Hide password" : "Show password"}
                    >
                      {showPwd ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </Field>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full gap-1.5 rounded-none font-mono text-sm uppercase tracking-wider glow-green"
                >
                  {loading ? "provisioning..." : "CREATE ACCESS"}
                  <Terminal className="size-4" />
                </Button>
                <p className="text-center font-mono text-[11px] text-muted-foreground">
                  By signing up you accept the rules of engagement.
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
                <Field
                  label="email"
                  icon={<Mail className="size-4" />}
                  error={forgotForm.formState.errors.email?.message}
                >
                  <Input
                    type="email"
                    placeholder="anon@protonmail.com"
                    {...forgotForm.register("email")}
                    className="rounded-none border-border/50 bg-background/60 font-mono text-sm lowercase focus-visible:border-primary"
                  />
                </Field>
                <Button
                  type="submit"
                  className="w-full gap-1.5 rounded-none font-mono text-sm uppercase tracking-wider glow-green"
                >
                  TRANSMIT RESET
                </Button>
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="flex items-center gap-1 font-mono text-xs text-muted-foreground hover:text-primary"
                >
                  <ArrowLeft className="size-3" /> back to login
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {authMode !== "forgot" && (
            <>
              <Divider />
              <Button
                variant="outline"
                className="w-full gap-2 rounded-none border-border/50 font-mono text-xs uppercase tracking-wider"
                onClick={onGoogle}
                disabled={loading}
              >
                <GoogleIcon /> OAuth · Google
              </Button>

              <div className="mt-4 rounded-md border border-dashed border-primary/30 bg-primary/5 p-3">
                <p className="mb-2 text-center font-mono text-[11px] font-semibold uppercase tracking-wider text-primary/80">
                  {"> "}Quick Access
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={enterStudentDemo}
                    className="gap-1.5 rounded-none border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <UserIcon className="size-3.5" /> Student
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAuthOpen(false);
                      window.open("/admin.html", "_blank");
                    }}
                    className="gap-1.5 rounded-none border-primary/40 font-mono text-xs uppercase tracking-wider text-primary hover:bg-primary/10 hover:text-primary"
                  >
                    <Shield className="size-3.5" /> Admin
                  </Button>
                </div>
              </div>
            </>
          )}

          {authMode === "login" && (
            <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
              No access?{" "}
              <button
                onClick={() => setMode("signup")}
                className="font-semibold text-primary hover:underline"
              >
                ./provision_account
              </button>
            </p>
          )}
          {authMode === "signup" && (
            <p className="mt-4 text-center font-mono text-xs text-muted-foreground">
              Already provisioned?{" "}
              <button
                onClick={() => setMode("login")}
                className="font-semibold text-primary hover:underline"
              >
                ./authenticate
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
      <Label className="flex items-center gap-1.5 font-mono text-xs lowercase text-muted-foreground">
        {icon && <span className="text-primary/70">{icon}</span>}
        <span className="text-primary/50">$</span>
        {label}
      </Label>
      {children}
      {error && (
        <p className="font-mono text-xs text-destructive">
          {"> "}err: {error}
        </p>
      )}
    </div>
  );
}

function Divider() {
  return (
    <div className="my-4 flex items-center gap-3">
      <div className="h-px flex-1 bg-primary/20" />
      <span className="font-mono text-xs text-muted-foreground">or</span>
      <div className="h-px flex-1 bg-primary/20" />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
