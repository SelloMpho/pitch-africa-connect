import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Briefcase, Search, Building2, Eye, Heart, ArrowRight, Filter, DollarSign } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/ui/stat-card";

interface Profile {
  full_name: string;
  location: string | null;
  bio: string | null;
  portfolio_count: number | null;
  ticket_size_min: number | null;
  ticket_size_max: number | null;
  investment_focus: string[] | null;
  preferred_stages: string[] | null;
}

interface Startup {
  id: string;
  full_name: string;
  company_name: string | null;
  industry: string | null;
  funding_stage: string | null;
  funding_amount_needed: number | null;
  pitch_summary: string | null;
  location: string | null;
}

const InvestorDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [startups, setStartups] = useState<Startup[]>([]);

  useEffect(() => {
    checkAuth();
    fetchProfile();
    fetchStartups();
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

    if (roleData?.role !== "investor") {
      toast({
        title: "Access Denied",
        description: "This dashboard is only for investors",
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

  const fetchStartups = async () => {
    try {
      const { data: entrepreneurIds } = await supabase
        .from("user_roles")
        .select("user_id")
        .eq("role", "entrepreneur");

      if (!entrepreneurIds) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, company_name, industry, funding_stage, funding_amount_needed, pitch_summary, location")
        .in("id", entrepreneurIds.map((e) => e.user_id))
        .limit(10);

      if (error) throw error;
      setStartups(data || []);
    } catch (error) {
      console.error("Error fetching startups:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-accent border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      title="Investor Dashboard"
      subtitle="Discover promising startups and manage your portfolio"
      userRole="investor"
      userName={profile?.full_name}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Portfolio Size"
          value={profile?.portfolio_count || 0}
          subtitle="Companies invested"
          icon={Briefcase}
          variant="primary"
        />
        <StatCard
          title="Ticket Size"
          value={`$${profile?.ticket_size_min?.toLocaleString() || "0"}`}
          subtitle={`to $${profile?.ticket_size_max?.toLocaleString() || "0"}`}
          icon={DollarSign}
          variant="secondary"
        />
        <StatCard
          title="Industries Tracked"
          value={profile?.investment_focus?.length || 0}
          subtitle="Investment focus areas"
          icon={Search}
          variant="accent"
        />
        <StatCard
          title="Available Startups"
          value={startups.length}
          subtitle="Seeking funding"
          icon={TrendingUp}
          variant="default"
          trend={{ value: 15, isPositive: true }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Startups Grid */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">Available Startups</CardTitle>
                  <CardDescription>Discover and connect with entrepreneurs seeking funding</CardDescription>
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {startups.map((startup) => (
                  <div
                    key={startup.id}
                    className="group p-4 rounded-xl border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold">
                          {startup.company_name?.charAt(0) || "S"}
                        </div>
                        <div>
                          <h3 className="font-semibold">{startup.company_name || "Unnamed Startup"}</h3>
                          <p className="text-xs text-muted-foreground">{startup.location || "Location N/A"}</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {startup.pitch_summary || "No pitch summary available."}
                    </p>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="secondary" className="text-xs">
                        {startup.industry || "N/A"}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {startup.funding_stage || "N/A"}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Seeking</p>
                        <p className="font-semibold text-secondary">
                          ${startup.funding_amount_needed?.toLocaleString() || "0"}
                        </p>
                      </div>
                      <Button size="sm" className="gap-2 group-hover:bg-primary">
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              {startups.length === 0 && (
                <div className="text-center py-12">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No startups found</h3>
                  <p className="text-muted-foreground text-sm">
                    Check back later for new opportunities
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Investment Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Investment Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Investment Focus</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.investment_focus?.map((focus, index) => (
                    <Badge key={index} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20">
                      {focus}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">Not specified</p>}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2 text-muted-foreground">Preferred Stages</p>
                <div className="flex flex-wrap gap-2">
                  {profile?.preferred_stages?.map((stage, index) => (
                    <Badge key={index} variant="outline">
                      {stage}
                    </Badge>
                  )) || <p className="text-sm text-muted-foreground">Not specified</p>}
                </div>
              </div>

              <Button variant="outline" className="w-full gap-2 group">
                <Building2 className="h-4 w-4" />
                Update Preferences
                <ArrowRight className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </CardContent>
          </Card>

          {/* About Card */}
          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardContent className="pt-6 relative">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/20 w-fit">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Your Bio</h3>
                  <p className="text-primary-foreground/80 text-sm mt-2 leading-relaxed">
                    {profile?.bio || "Add your bio to let entrepreneurs know more about your investment philosophy and experience."}
                  </p>
                </div>
                <Button variant="secondary" className="w-full">
                  Edit Profile
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activity Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: "Startups Viewed", value: "24", trend: "+12%" },
                { label: "Saved Startups", value: "8", trend: "+5%" },
                { label: "Meetings Scheduled", value: "3", trend: "+2" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2 border-b last:border-0">
                  <span className="text-sm text-muted-foreground">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{item.value}</span>
                    <span className="text-xs text-secondary">{item.trend}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default InvestorDashboard;
