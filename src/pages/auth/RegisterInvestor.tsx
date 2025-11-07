import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { Checkbox } from "@/components/ui/checkbox";

const investorSchema = z.object({
  fullName: z.string().min(2, { message: "Full name is required" }),
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  location: z.string().min(2, { message: "Location is required" }),
  ticketSizeMin: z.number().positive({ message: "Minimum investment must be positive" }),
  ticketSizeMax: z.number().positive({ message: "Maximum investment must be positive" }),
  portfolioCount: z.number().min(0, { message: "Portfolio count cannot be negative" }),
  bio: z.string().min(50, { message: "Bio must be at least 50 characters" }),
  website: z.string().url({ message: "Invalid website URL" }).optional().or(z.literal("")),
});

const INDUSTRIES = [
  "FinTech", "HealthTech", "EdTech", "E-commerce", "SaaS", 
  "CleanTech", "AgriTech", "PropTech", "AI/ML", "Other"
];

const STAGES = ["Pre-Seed", "Seed", "Series A", "Series B", "Series C+"];

const RegisterInvestor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    location: "",
    ticketSizeMin: "",
    ticketSizeMax: "",
    portfolioCount: "",
    bio: "",
    website: "",
  });

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
  const [selectedStages, setSelectedStages] = useState<string[]>([]);

  const handleChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleIndustry = (industry: string) => {
    setSelectedIndustries(prev =>
      prev.includes(industry)
        ? prev.filter(i => i !== industry)
        : [...prev, industry]
    );
  };

  const toggleStage = (stage: string) => {
    setSelectedStages(prev =>
      prev.includes(stage)
        ? prev.filter(s => s !== stage)
        : [...prev, stage]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedIndustries.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least one industry focus",
        });
        setLoading(false);
        return;
      }

      if (selectedStages.length === 0) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Please select at least one preferred funding stage",
        });
        setLoading(false);
        return;
      }

      const validation = investorSchema.safeParse({
        ...formData,
        ticketSizeMin: Number(formData.ticketSizeMin),
        ticketSizeMax: Number(formData.ticketSizeMax),
        portfolioCount: Number(formData.portfolioCount),
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

      if (Number(formData.ticketSizeMin) > Number(formData.ticketSizeMax)) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          description: "Minimum ticket size cannot be greater than maximum",
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
            location: formData.location,
            bio: formData.bio,
            investment_focus: selectedIndustries,
            ticket_size_min: Number(formData.ticketSizeMin),
            ticket_size_max: Number(formData.ticketSizeMax),
            preferred_stages: selectedStages,
            portfolio_count: Number(formData.portfolioCount),
            website: formData.website || null,
          });

        if (profileError) throw profileError;

        const { error: roleError } = await supabase
          .from("user_roles")
          .insert({
            user_id: data.user.id,
            role: "investor",
          });

        if (roleError) throw roleError;

        toast({
          title: "Account created!",
          description: "Welcome to PitchPoint.",
        });
        navigate("/dashboard/investor");
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
          <div className="w-12 h-12 rounded-lg bg-[image:var(--gradient-success)] flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-secondary-foreground" />
          </div>
          <CardTitle className="text-3xl">Register as Investor</CardTitle>
          <CardDescription>
            Share your investment preferences and discover promising South African startups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  placeholder="Jane Smith"
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

            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <Input
                id="location"
                placeholder="Johannesburg, South Africa"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Investment Focus (Industries) *</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {INDUSTRIES.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={selectedIndustries.includes(industry)}
                      onCheckedChange={() => toggleIndustry(industry)}
                      disabled={loading}
                    />
                    <Label htmlFor={industry} className="cursor-pointer text-sm">
                      {industry}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Preferred Funding Stages *</Label>
              <div className="grid grid-cols-2 gap-3 p-4 border rounded-lg">
                {STAGES.map((stage) => (
                  <div key={stage} className="flex items-center space-x-2">
                    <Checkbox
                      id={stage}
                      checked={selectedStages.includes(stage)}
                      onCheckedChange={() => toggleStage(stage)}
                      disabled={loading}
                    />
                    <Label htmlFor={stage} className="cursor-pointer text-sm">
                      {stage}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticketSizeMin">Min Ticket Size (ZAR) *</Label>
                <Input
                  id="ticketSizeMin"
                  type="number"
                  min="0"
                  placeholder="100000"
                  value={formData.ticketSizeMin}
                  onChange={(e) => handleChange("ticketSizeMin", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticketSizeMax">Max Ticket Size (ZAR) *</Label>
                <Input
                  id="ticketSizeMax"
                  type="number"
                  min="0"
                  placeholder="5000000"
                  value={formData.ticketSizeMax}
                  onChange={(e) => handleChange("ticketSizeMax", e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="portfolioCount">Current Portfolio Companies *</Label>
              <Input
                id="portfolioCount"
                type="number"
                min="0"
                placeholder="5"
                value={formData.portfolioCount}
                onChange={(e) => handleChange("portfolioCount", e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website (Optional)</Label>
              <Input
                id="website"
                type="url"
                placeholder="https://yourfund.com"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">About You * (min 50 characters)</Label>
              <Textarea
                id="bio"
                placeholder="Describe your investment philosophy, experience, and what you look for in startups..."
                value={formData.bio}
                onChange={(e) => handleChange("bio", e.target.value)}
                disabled={loading}
                rows={4}
                required
              />
              <p className="text-xs text-muted-foreground">
                {formData.bio.length} / 50 minimum characters
              </p>
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Creating Account..." : "Create Investor Account"}
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

export default RegisterInvestor;
