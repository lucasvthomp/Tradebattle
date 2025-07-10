import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginUser, RegisterUser, loginSchema, registerSchema } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, TrendingUp, Shield, Users } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("login");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const loginForm = useForm<LoginUser>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<RegisterUser>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onLogin = (data: LoginUser) => {
    loginMutation.mutate(data);
  };

  const onRegister = (data: RegisterUser) => {
    registerMutation.mutate(data);
  };

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-4rem)]">
          {/* Left side - Authentication forms */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Welcome to ORSATH</h1>
              <p className="text-muted-foreground">
                Orellana, Santhos & Thompson Investment Research
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-md mx-auto">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Sign In</TabsTrigger>
                <TabsTrigger value="register">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Sign In</CardTitle>
                    <CardDescription>
                      Enter your credentials to access your account
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <Input
                          id="login-email"
                          type="email"
                          placeholder="your@email.com"
                          {...loginForm.register("email")}
                        />
                        {loginForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="login-password">Password</Label>
                        <Input
                          id="login-password"
                          type="password"
                          placeholder="••••••••"
                          {...loginForm.register("password")}
                        />
                        {loginForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {loginForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create Account</CardTitle>
                    <CardDescription>
                      Join ORSATH for professional investment research
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="register-name">Full Name</Label>
                        <Input
                          id="register-name"
                          placeholder="John Doe"
                          {...registerForm.register("name")}
                        />
                        {registerForm.formState.errors.name && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-email">Email</Label>
                        <Input
                          id="register-email"
                          type="email"
                          placeholder="your@email.com"
                          {...registerForm.register("email")}
                        />
                        {registerForm.formState.errors.email && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.email.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="register-password">Password</Label>
                        <Input
                          id="register-password"
                          type="password"
                          placeholder="••••••••"
                          {...registerForm.register("password")}
                        />
                        {registerForm.formState.errors.password && (
                          <p className="text-sm text-red-500">
                            {registerForm.formState.errors.password.message}
                          </p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right side - Hero section */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/5 rounded-lg" />
              <div className="relative bg-white dark:bg-gray-800 rounded-lg p-8 shadow-xl">
                <div className="space-y-6">
                  <div className="text-center">
                    <h2 className="text-2xl font-bold mb-2">
                      Professional Investment Research
                    </h2>
                    <p className="text-muted-foreground">
                      Access in-depth qualitative analysis and market insights from our expert research team
                    </p>
                  </div>

                  <div className="grid gap-4">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Real-Time Market Data</h3>
                        <p className="text-sm text-muted-foreground">
                          Live stock quotes and comprehensive market analysis
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Shield className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Personalized Watchlists</h3>
                        <p className="text-sm text-muted-foreground">
                          Track your investments with custom watchlists that save automatically
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <Users className="h-6 w-6 text-purple-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Expert Research</h3>
                        <p className="text-sm text-muted-foreground">
                          In-depth studies and analysis from our research team
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}