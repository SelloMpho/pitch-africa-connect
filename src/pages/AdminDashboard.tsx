import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Users, Building2, TrendingUp, Activity, Eye, MoreHorizontal } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import StatCard from "@/components/ui/stat-card";

interface UserProfile {
  id: string;
  full_name: string;
  company_name: string | null;
  location: string | null;
  created_at: string;
  role: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [userName, setUserName] = useState<string>("");
  const [stats, setStats] = useState({
    totalUsers: 0,
    entrepreneurs: 0,
    investors: 0,
  });

  useEffect(() => {
    checkAuth();
    fetchDashboardData();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setUserName(profileData.full_name);
    }

    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (roleData?.role !== "admin") {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/");
    }
  };

  const fetchDashboardData = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select(`id, full_name, company_name, location, created_at`)
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      const usersWithRoles = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: roleData } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", profile.id)
            .single();

          return {
            ...profile,
            role: roleData?.role || "unknown",
          };
        })
      );

      setUsers(usersWithRoles);

      const entrepreneurs = usersWithRoles.filter((u) => u.role === "entrepreneur").length;
      const investors = usersWithRoles.filter((u) => u.role === "investor").length;

      setStats({
        totalUsers: usersWithRoles.length,
        entrepreneurs,
        investors,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
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
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "entrepreneur":
        return "default";
      case "investor":
        return "secondary";
      case "admin":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <DashboardLayout
      title="Admin Dashboard"
      subtitle="Monitor and manage your platform"
      userRole="admin"
      userName={userName}
    >
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Users"
          value={stats.totalUsers}
          subtitle="Registered accounts"
          icon={Users}
          variant="primary"
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Entrepreneurs"
          value={stats.entrepreneurs}
          subtitle="Active startups"
          icon={Building2}
          variant="secondary"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Investors"
          value={stats.investors}
          subtitle="Active investors"
          icon={TrendingUp}
          variant="accent"
          trend={{ value: 5, isPositive: true }}
        />
        <StatCard
          title="Platform Activity"
          value="98%"
          subtitle="System health"
          icon={Activity}
          variant="default"
        />
      </div>

      {/* Recent Activity & Users Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl">All Users</CardTitle>
                  <CardDescription>Manage and monitor platform users</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead className="font-semibold">User</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold">Role</TableHead>
                    <TableHead className="font-semibold">Joined</TableHead>
                    <TableHead className="font-semibold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.slice(0, 5).map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold text-sm">
                            {user.full_name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name}</p>
                            <p className="text-xs text-muted-foreground">{user.location || "No location"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{user.company_name || "—"}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">User Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Entrepreneurs</span>
                  <span className="font-semibold">{stats.entrepreneurs}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.entrepreneurs / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Investors</span>
                  <span className="font-semibold">{stats.investors}</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-secondary-light rounded-full transition-all duration-500"
                    style={{ width: `${stats.totalUsers > 0 ? (stats.investors / stats.totalUsers) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-white/20 w-fit">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Platform Insights</h3>
                  <p className="text-primary-foreground/80 text-sm mt-1">
                    Your platform is growing! {stats.totalUsers} users have joined.
                  </p>
                </div>
                <Button variant="secondary" className="w-full">
                  View Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
