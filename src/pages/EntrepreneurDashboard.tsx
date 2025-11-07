import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Building2, DollarSign, MapPin, Globe, LogOut, Edit } from "lucide-react";

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Entrepreneur Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{profile?.company_name || "Your Company"}</CardTitle>
                    <CardDescription>{profile?.industry || "No industry specified"}</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Pitch Summary</h3>
                  <p className="text-muted-foreground">
                    {profile?.pitch_summary || "No pitch summary added yet. Add your elevator pitch to attract investors."}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Founding Year</p>
                    <p className="font-medium">{profile?.founding_year || "—"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Funding Stage</p>
                    <Badge>{profile?.funding_stage || "Not specified"}</Badge>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {profile?.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{profile.location}</span>
                    </div>
                  )}
                  {profile?.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-sm text-primary hover:underline">
                        Visit Website
                      </a>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Company Information
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <DollarSign className="mr-2 h-4 w-4" />
                  View Investor Matches
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Funding Goal</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${profile?.funding_amount_needed?.toLocaleString() || "0"}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Target amount needed</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Completion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Profile strength</span>
                    <span className="font-medium">
                      {[
                        profile?.company_name,
                        profile?.industry,
                        profile?.pitch_summary,
                        profile?.funding_stage,
                        profile?.location,
                      ].filter(Boolean).length * 20}%
                    </span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{
                        width: `${[
                          profile?.company_name,
                          profile?.industry,
                          profile?.pitch_summary,
                          profile?.funding_stage,
                          profile?.location,
                        ].filter(Boolean).length * 20}%`,
                      }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Complete your profile to increase visibility to investors
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default EntrepreneurDashboard;
