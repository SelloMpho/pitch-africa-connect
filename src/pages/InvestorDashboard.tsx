import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { TrendingUp, Briefcase, Search, LogOut, Building2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
          <h1 className="text-2xl font-bold">Investor Dashboard</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Portfolio Size</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.portfolio_count || 0}</div>
              <p className="text-xs text-muted-foreground">Companies invested in</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Size</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${profile?.ticket_size_min?.toLocaleString() || "0"}
              </div>
              <p className="text-xs text-muted-foreground">
                to ${profile?.ticket_size_max?.toLocaleString() || "0"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Investment Focus</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {profile?.investment_focus?.length || 0}
              </div>
              <p className="text-xs text-muted-foreground">Industries tracked</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Startups</CardTitle>
                <CardDescription>Discover and connect with entrepreneurs seeking funding</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Industry</TableHead>
                      <TableHead>Stage</TableHead>
                      <TableHead>Seeking</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {startups.map((startup) => (
                      <TableRow key={startup.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{startup.company_name || "Unnamed Company"}</p>
                            <p className="text-sm text-muted-foreground">{startup.location || "Location N/A"}</p>
                          </div>
                        </TableCell>
                        <TableCell>{startup.industry || "—"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{startup.funding_stage || "N/A"}</Badge>
                        </TableCell>
                        <TableCell>${startup.funding_amount_needed?.toLocaleString() || "0"}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">View</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Investment Focus</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.investment_focus?.map((focus, index) => (
                      <Badge key={index} variant="secondary">{focus}</Badge>
                    )) || <p className="text-sm text-muted-foreground">Not specified</p>}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium mb-2">Preferred Stages</p>
                  <div className="flex flex-wrap gap-2">
                    {profile?.preferred_stages?.map((stage, index) => (
                      <Badge key={index} variant="secondary">{stage}</Badge>
                    )) || <p className="text-sm text-muted-foreground">Not specified</p>}
                  </div>
                </div>

                <Button className="w-full">
                  <Building2 className="mr-2 h-4 w-4" />
                  Update Preferences
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>About You</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {profile?.bio || "Add your bio to let entrepreneurs know more about your investment philosophy and experience."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default InvestorDashboard;
