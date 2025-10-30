"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Mail, Sparkles } from "lucide-react";
import { OpenDoorLogo } from "@/components/open-door-logo";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast"; // ✅ Toast for Snackbar

  
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);

    try {
      const response = await axios.post("https://openbacken-production.up.railway.app/api/admin/login", data);
      console.log("Login Success:", response.data);

      // ✅ Token Store in LocalStorage
      localStorage.setItem("adminToken", response.data.token);

      // ✅ Show Success Toast
      toast.success("Login Successful!");

      // ✅ Redirect to Dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err: any) {
      console.error("Login Failed:", err.response?.data || err.message);
      
      // ❌ Show Error Toast
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotPasswordEmail || !forgotPasswordEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setIsSendingReset(true);

    try {
      const response = await axios.post(
        "https://openbacken-production.up.railway.app/api/admin/forgot-password",
        { email: forgotPasswordEmail }
      );

      toast.success("Password reset link sent to your email!");
      console.log("Reset Token (Dev Only):", response.data.resetToken);
      
      setIsForgotPasswordOpen(false);
      setForgotPasswordEmail("");
    } catch (err: any) {
      console.error("Forgot Password Failed:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to send reset email. Please try again.");
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden p-4">
      {/* Modern animated background with gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          opacity: 0.4
        }}></div>
      </div>

      <Card className="w-full max-w-md relative z-10 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 shadow-2xl border border-white/20 dark:border-slate-700/50">
        <CardHeader className="space-y-4 text-center pb-8 pt-8">
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 rounded-full"></div>
              <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                <OpenDoorLogo size="lg" className="relative" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="inline-block">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent animate-gradient">
                Welcome Back
              </CardTitle>
              <div className="h-1 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-full mt-2 animate-gradient"></div>
            </div>
            <CardDescription className="text-base text-muted-foreground">
              Sign in to access your <span className="font-semibold text-foreground">Open Door</span> admin dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="admin@example.com" {...field} disabled={isLoading} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          {...field}
                          disabled={isLoading}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full relative overflow-hidden group bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-blue-500/40 hover:shadow-xl hover:shadow-indigo-500/50 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]" 
                disabled={isLoading}
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></span>
                {isLoading ? (
                  <span className="flex items-center gap-2 relative z-10">
                    <Sparkles className="h-4 w-4 animate-spin" />
                    Logging in...
                  </span>
                ) : (
                  <span className="relative z-10 font-semibold flex items-center justify-center gap-2">
                    Sign In
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </Button>

              <div className="text-center mt-4">
                <Dialog open={isForgotPasswordOpen} onOpenChange={setIsForgotPasswordOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                      Forgot Password?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Mail className="h-5 w-5" />
                        Reset Password
                      </DialogTitle>
                      <DialogDescription>
                        Enter your email address and we'll send you a password reset link.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="admin@example.com"
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          disabled={isSendingReset}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleForgotPassword();
                            }
                          }}
                        />
                      </div>
                    </div>
                    <DialogFooter className="sm:justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsForgotPasswordOpen(false);
                          setForgotPasswordEmail("");
                        }}
                        disabled={isSendingReset}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="button"
                        onClick={handleForgotPassword}
                        disabled={isSendingReset}
                      >
                        {isSendingReset ? "Sending..." : "Send Reset Link"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="flex flex-col border-t border-slate-200/50 dark:border-slate-700/50 pt-6">
          <div className="text-sm text-center space-y-3">
            <div className="flex items-center justify-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent via-blue-300 to-transparent dark:via-blue-700"></div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo Access</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent via-blue-300 to-transparent dark:via-blue-700"></div>
            </div>
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 backdrop-blur-sm rounded-lg p-4 space-y-2 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-xs text-blue-700 dark:text-blue-300 font-mono flex items-center justify-center gap-2">
                  <Mail className="h-3 w-3" />
                  <span className="font-semibold">admin@example.com</span>
                </p>
                <p className="text-xs text-blue-700 dark:text-blue-300 font-mono flex items-center justify-center gap-2">
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <span className="font-semibold">password</span>
                </p>
              </div>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
