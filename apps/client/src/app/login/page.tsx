"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { login } from "@/lib/auth";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const [userId, setUserId] = useState("");
  const [twoFactorCode, setTwoFactorCode] = useState("");
  const router = useRouter();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const result = await login(data);

      if (result.requiresTwoFactor) {
        setRequires2FA(true);
        setUserId(result.data?.userId || "");
        toast({
          title: "2FA Required",
          description: "Please enter your 2FA code from your authenticator app.",
        });
      } else if (result.success && result.data?.user) {
        authLogin(result.data.user);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        // Force a hard refresh to ensure clean state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (error: any) {
      toast({
        title: "Login failed",
        description: error.message || "Invalid email or password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { loginWithTwoFactor } = await import("@/lib/auth");
      const result = await loginWithTwoFactor(userId, twoFactorCode);

      if (result.success && result.data?.user) {
        authLogin(result.data.user);
        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        // Force a hard refresh to ensure clean state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        throw new Error(result.message || "2FA verification failed");
      }
    } catch (error: any) {
      toast({
        title: "Verification failed",
        description: error.message || "Invalid 2FA code",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-12 flex-col justify-between relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />

        {/* Decorative illustrations */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 left-10 w-64 h-64">
            <Image
              src="/login-illustration.svg"
              alt=""
              width={256}
              height={256}
              className="w-full h-full"
              priority
            />
          </div>
          <div className="absolute bottom-32 right-8 w-48 h-48">
            <Image
              src="/productivity-illustration.svg"
              alt=""
              width={192}
              height={192}
              className="w-full h-full"
              priority
            />
          </div>
        </div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 text-white mb-8">
            <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
              <CheckSquare className="h-8 w-8" />
            </div>
            <h1 className="text-3xl font-bold">TaskFlow</h1>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4 text-white/90">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Organize Your Work</h3>
              <p className="text-white/70">
                Manage tasks with a minimal interface. Prioritize, track, and deliver faster.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white/90">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Secure & Private</h3>
              <p className="text-white/70">
                Industry-standard security with optional 2FA authentication keeps your data safe.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white/90">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Real-time Updates</h3>
              <p className="text-white/70">
                Stay in sync with instant updates and seamless collaboration features.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-white/60 text-sm">© 2025 TaskFlow.</div>
      </div>

      {/* Right side - Login form */}
      <div
        className="flex-1 flex items-center justify-center p-8 bg-background animate-fade-in"
        style={{ animationDelay: "0.1s" }}
      >
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <CheckSquare className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">TaskFlow</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-2 text-muted-foreground">Sign in to your account to continue</p>
          </div>

          {!requires2FA ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      className="pl-10"
                      {...register("email", { required: "Email is required" })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10"
                      {...register("password", { required: "Password is required" })}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign in
              </Button>

              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                <Link href="/signup" className="text-primary hover:underline font-medium">
                  Sign up
                </Link>
              </div>
            </form>
          ) : (
            <form onSubmit={handle2FASubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="twoFactorCode">2FA Code</Label>
                <Input
                  id="twoFactorCode"
                  type="text"
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ""))}
                  className="text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-muted-foreground">
                  Enter the 6-digit code from your authenticator app
                </p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Verify & Sign in
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setRequires2FA(false)}
              >
                Back to login
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
