import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Briefcase, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const authSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  fullName: z.string().min(2, { message: "Full name is required" }).optional(),
});

type UserRole = "entrepreneur" | "investor";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get("mode") || "login";
  const [isLogin, setIsLogin] = useState(mode === "login");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleAuth = async (role?: UserRole) => {
    setLoading(true);
    try {
      // Validate inputs
      const validation = authSchema.safeParse({
        email,
        password,
        fullName: isLogin ? undefined : fullName,
      });

      if (!validation.success) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: validation.error.errors[0].message,
        });
        setLoading(false);
        return;
      }

      if (isLogin) {
        // Login - no role check needed
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast({
          title: "Welcome back!",
          description: "Successfully logged in.",
        });
        navigate("/");
      } else {
        // Signup
        if (!fullName) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Full name is required",
          });
          setLoading(false);
          return;
        }

        if (!role) {
          toast({
            variant: "destructive",
            title: "Validation Error",
            description: "Please select a role",
          });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });

        if (error) throw error;

        if (data.user) {
          // Create profile
          const { error: profileError } = await supabase
            .from("profiles")
            .insert({
              id: data.user.id,
              full_name: fullName,
            });

          if (profileError) throw profileError;

          // Assign role
          const { error: roleError } = await supabase
            .from("user_roles")
            .insert({
              user_id: data.user.id,
              role: role,
            });

          if (roleError) throw roleError;

          toast({
            title: "Account created!",
            description: "Welcome to PitchPoint.",
          });
          navigate("/");
        }
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "An error occurred. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[image:var(--gradient-subtle)] flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">
            {isLogin ? "Welcome Back to PitchPoint" : "Join PitchPoint"}
          </h1>
          <p className="text-muted-foreground">
            {isLogin
              ? "Select your account type to continue"
              : "Choose how you want to get started"}
          </p>
        </div>

        {!isLogin && (
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Entrepreneur Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-medium)] ${
                selectedRole === "entrepreneur" ? "ring-2 ring-primary shadow-[var(--shadow-strong)]" : ""
              }`}
              onClick={() => setSelectedRole("entrepreneur")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-primary-foreground" />
                </div>
                <CardTitle className="text-2xl">Entrepreneur</CardTitle>
                <CardDescription>
                  Showcase your startup and connect with investors
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Create your business profile</li>
                  <li>✓ Upload pitch decks and videos</li>
                  <li>✓ Connect with potential investors</li>
                  <li>✓ Track pitch performance</li>
                </ul>
              </CardContent>
            </Card>

            {/* Investor Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 hover:shadow-[var(--shadow-medium)] ${
                selectedRole === "investor" ? "ring-2 ring-primary shadow-[var(--shadow-strong)]" : ""
              }`}
              onClick={() => setSelectedRole("investor")}
            >
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-[image:var(--gradient-success)] flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl">Investor</CardTitle>
                <CardDescription>
                  Discover and invest in promising South African startups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>✓ Browse verified startups</li>
                  <li>✓ Filter by industry and stage</li>
                  <li>✓ Direct messaging with founders</li>
                  <li>✓ Track investment opportunities</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Auth Form */}
        {(isLogin || selectedRole) && (
          <Card className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader>
              <CardTitle>
                {isLogin ? "Sign In" : `Create Account as ${selectedRole === "entrepreneur" ? "an Entrepreneur" : "an Investor"}`}
              </CardTitle>
              <CardDescription>
                {isLogin
                  ? "Enter your credentials to continue"
                  : "Fill in your details to get started"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={() => handleAuth(isLogin ? undefined : selectedRole)}
                disabled={loading}
              >
                {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setEmail("");
                    setPassword("");
                    setFullName("");
                  }}
                  className="text-primary hover:underline"
                  disabled={loading}
                >
                  {isLogin
                    ? "Don't have an account? Sign up"
                    : "Already have an account? Sign in"}
                </button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mt-6">
          <Button variant="link" onClick={() => navigate("/")} disabled={loading}>
            ← Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
