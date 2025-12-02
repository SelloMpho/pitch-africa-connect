import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, DollarSign, MapPin, Globe, Edit, Target, Users, Rocket, ArrowRight, TrendingUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/ui/stat-card";

interface Profile {
  full_name: string;
  company_name: string | null;
  industry: string | null;
  founding_year: number | null;
  location: string | null;
  funding_stage: string | null;
  funding_amount_needed: number | null;
  pitch_summary: string | null;
  website: string | null;
}

const EntrepreneurDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    checkAuth();
    fetchProfile();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "entrepreneur") {
      toast({
        title: "Access Denied",
        description: "This dashboard is only for entrepreneurs",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const profileCompletion = [
    profile?.company_name,
    profile?.industry,
    profile?.pitch_summary,
    profile?.funding_stage,
    profile?.location,
  ].filter(Boolean).length * 20;

  return (
    <DashboardLayout
      title="Entrepreneur Dashboard"
      subtitle="Manage your startup and connect with investors"
      userRole="entrepreneur"
      userName={profile?.full_name}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Funding Goal"
          value={`$${profile?.funding_amount_needed?.toLocaleString() || "0"}`}
          subtitle="Target amount"
          icon={Target}
          variant="primary"
        />
        <StatCard
          title="Profile Views"
          value="124"
          subtitle="This month"
          icon={Users}
          variant="secondary"
          trend={{ value: 23, isPositive: true }}
        />
        <StatCard
          title="Investor Matches"
          value="8"
          subtitle="Potential investors"
          icon={TrendingUp}
          variant="accent"
        />
        <StatCard
          title="Profile Strength"
          value={`${profileCompletion}%`}
          subtitle="Completion rate"
          icon={Rocket}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Profile Card */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-secondary/10 via-secondary/5 to-transparent p-6 border-b">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center text-white shadow-lg">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{profile?.company_name || "Your Company"}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">{profile?.industry || "No industry"}</Badge>
                      <Badge variant="outline">{profile?.funding_stage || "Stage N/A"}</Badge>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit
                </Button>
              </div>
            </div>
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <Rocket className="h-5 w-5 text-secondary" />
                  Pitch Summary
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {profile?.pitch_summary || "No pitch summary added yet. Add your elevator pitch to attract investors and make a great first impression."}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold">{profile?.founding_year || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Founded</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold">{profile?.funding_stage || "—"}</p>
                  <p className="text-xs text-muted-foreground mt-1">Stage</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold">5</p>
                  <p className="text-xs text-muted-foreground mt-1">Team Size</p>
                </div>
                <div className="text-center p-4 rounded-xl bg-muted/50">
                  <p className="text-2xl font-bold">3</p>
                  <p className="text-xs text-muted-foreground mt-1">Pitches</p>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap pt-4">
                {profile?.location && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{profile.location}</span>
                  </div>
                )}
                {profile?.website && (
                  <a
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    <span className="text-sm">Visit Website</span>
                  </a>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Common tasks to manage your startup</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="h-auto py-4 justify-start gap-4 group">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">Update Company Info</p>
                  <p className="text-xs text-muted-foreground">Edit your startup details</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start gap-4 group">
                <div className="p-2 rounded-lg bg-secondary/10 group-hover:bg-secondary group-hover:text-secondary-foreground transition-colors">
                  <DollarSign className="h-5 w-5" />
                </div>
                <div className="text-left">
                  <p className="font-medium">View Investor Matches</p>
                  <p className="text-xs text-muted-foreground">Find potential investors</p>
                </div>
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Funding Goal Card */}
          <Card className="bg-gradient-to-br from-secondary to-secondary-light text-secondary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="pt-6 relative">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/20 w-fit">
                  <Target className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-secondary-foreground/80 text-sm">Funding Goal</p>
                  <p className="text-3xl font-bold mt-1">
                    ${profile?.funding_amount_needed?.toLocaleString() || "0"}
                  </p>
                </div>
                <div className="pt-4 border-t border-white/20">
                  <p className="text-sm text-secondary-foreground/80">
                    Complete your profile to increase visibility to potential investors.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Profile Completion */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Profile Completion</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative pt-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm font-bold text-secondary">{profileCompletion}%</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full transition-all duration-500"
                    style={{ width: `${profileCompletion}%` }}
                  />
                </div>
              </div>
              <div className="space-y-2 pt-4">
                {[
                  { label: "Company Name", done: !!profile?.company_name },
                  { label: "Industry", done: !!profile?.industry },
                  { label: "Pitch Summary", done: !!profile?.pitch_summary },
                  { label: "Funding Stage", done: !!profile?.funding_stage },
                  { label: "Location", done: !!profile?.location },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3 text-sm">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center ${
                        item.done ? "bg-secondary text-white" : "bg-muted"
                      }`}
                    >
                      {item.done && "✓"}
                    </div>
                    <span className={item.done ? "text-foreground" : "text-muted-foreground"}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EntrepreneurDashboard;
