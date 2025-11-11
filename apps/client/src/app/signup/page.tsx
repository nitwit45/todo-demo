"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { Loader2, Mail, Lock, User as UserIcon, CheckSquare, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { signup } from "@/lib/auth";

interface SignupForm {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { login: authLogin } = useAuth();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignupForm>();
  const password = watch("password");

  const onSubmit = async (data: SignupForm) => {
    if (data.password !== data.confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await signup({
        name: data.name,
        email: data.email,
        password: data.password,
      });
      
      if (result.success && result.data?.user) {
        authLogin(result.data.user);
        toast({
          title: "Account created!",
          description: "Welcome to TaskFlow. Let's get started!",
        });
        // Force a hard refresh to ensure clean state
        setTimeout(() => {
          window.location.href = "/";
        }, 100);
      } else {
        throw new Error(result.message || "Signup failed");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message || "Failed to create account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-12 flex-col justify-between relative overflow-hidden animate-fade-in">
        <div className="absolute inset-0 bg-grid-white/10 bg-[size:30px_30px]" />
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
              <h3 className="font-semibold text-lg mb-1">Start in Seconds</h3>
              <p className="text-white/70">
                Create your account and start managing tasks immediately. No credit card required.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white/90">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Professional Tools</h3>
              <p className="text-white/70">
                Kanban boards, priority management, and powerful filters to keep you productive.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 text-white/90">
            <Sparkles className="h-6 w-6 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Free Forever</h3>
              <p className="text-white/70">
                Full access to all features. Join thousands of teams already using TaskFlow.
              </p>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/60 text-sm">
          © 2025 TaskFlow. Built with modern technologies.
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
              <CheckSquare className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">TaskFlow</h1>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Create your account</h2>
            <p className="mt-2 text-muted-foreground">
              Start managing your tasks like a pro
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="pl-10"
                    {...register("name", { 
                      required: "Name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" }
                    })}
                  />
                </div>
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    className="pl-10"
                    {...register("email", { 
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address"
                      }
                    })}
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
                    {...register("password", { 
                      required: "Password is required",
                      minLength: { value: 8, message: "Password must be at least 8 characters" }
                    })}
                  />
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    {...register("confirmPassword", { 
                      required: "Please confirm your password",
                      validate: value => value === password || "Passwords don't match"
                    })}
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create account
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              By creating an account, you agree to our Terms of Service and Privacy Policy
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

