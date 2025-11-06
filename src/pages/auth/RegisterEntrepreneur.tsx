import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const entrepreneurSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  companyName: z.string().min(2, { message: "Company name is required" }),
  industry: z.string().min(1, { message: "Industry is required" }),
  foundingYear: z.number().min(1900).max(new Date().getFullYear()),
  location: z.string().min(2, { message: "Location is required" }),
  fundingStage: z.string().min(1, { message: "Funding stage is required" }),
  fundingAmount: z.number().positive({ message: "Funding amount must be positive" }),
  pitchSummary: z.string().min(50, { message: "Pitch summary must be at least 50 characters" }),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
});

const RegisterEntrepreneur = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    companyName: "",
    industry: "",
    foundingYear: new Date().getFullYear(),
    location: "",
    fundingStage: "",
    fundingAmount: "",
    pitchSummary: "",
    website: "",
  });

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const validation = entrepreneurSchema.safeParse({
        ...formData,
        foundingYear: Number(formData.foundingYear),
        fundingAmount: Number(formData.fundingAmount),
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

      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({
            id: data.user.id,
            full_name: formData.fullName,
            company_name: formData.companyName,
            industry: formData.industry,
            founding_year: Number(formData.foundingYear),
            location: formData.location,
            funding_stage: formData.fundingStage,
            funding_amount_needed: Number(formData.fundingAmount),
            pitch_summary: formData.pitchSummary,
            website: formData.website || null,
          });

        if (profileError) throw profileError;

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "entrepreneur",
          });

        if (roleError) throw roleError;

        toast({
          title: "Account created!",
          description: "Welcome to PitchPoint.",
        });
        navigate("/");
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
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="w-12 h-12 rounded-lg bg-[image:var(--gradient-primary)] flex items-center justify-center mb-4">
            <Briefcase className="w-6 h-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">Register as Entrepreneur</CardTitle>
          <CardDescription>
            Tell us about your startup and let's connect you with investors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Startup Inc."
                  value={formData.companyName}
                  onChange={(e) => handleChange("companyName", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <Input
                  id="industry"
                  placeholder="e.g., FinTech, HealthTech"
                  value={formData.industry}
                  onChange={(e) => handleChange("industry", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="foundingYear">Founding Year *</Label>
                <Input
                  id="foundingYear"
                  type="number"
                  min="1900"
                  max={new Date().getFullYear()}
                  value={formData.foundingYear}
                  onChange={(e) => handleChange("foundingYear", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="Cape Town, South Africa"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fundingStage">Funding Stage *</Label>
                <Select
                  value={formData.fundingStage}
                  onValueChange={(value) => handleChange("fundingStage", value)}
                  disabled={loading}
                  required
                >
                  <SelectTrigger id="fundingStage">
                    <SelectValue placeholder="Select stage" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre-seed">Pre-Seed</SelectItem>
                    <SelectItem value="seed">Seed</SelectItem>
                    <SelectItem value="series-a">Series A</SelectItem>
                    <SelectItem value="series-b">Series B</SelectItem>
                    <SelectItem value="series-c">Series C+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fundingAmount">Funding Needed (ZAR) *</Label>
                <Input
                  id="fundingAmount"
                  type="number"
                  min="0"
                  placeholder="1000000"
                  value={formData.fundingAmount}
                  onChange={(e) => handleChange("fundingAmount", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourstartup.com"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pitchSummary">Pitch Summary * (min 50 characters)</Label>
              <Textarea
                id="pitchSummary"
                placeholder="Describe your startup, the problem you're solving, and your unique value proposition..."
                value={formData.pitchSummary}
                onChange={(e) => handleChange("pitchSummary", e.target.value)}
                disabled={loading}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.pitchSummary.length} / 50 minimum characters
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Entrepreneur Account"}
            </Button>

            <div className="text-center text-sm">
              <button
                type="button"
                onClick={() => navigate("/auth?mode=signup")}
                className="text-primary hover:underline"
                disabled={loading}
              >
                ← Back to role selection
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegisterEntrepreneur;
