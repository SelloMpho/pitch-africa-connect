import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { Users, TrendingUp, CheckCircle, Eye, ArrowUpRight, ArrowDownRight, FileCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { supabase } from "@/integrations/supabase/client";

interface RoleCount {
  name: string;
  value: number;
  color: string;
}

interface VerificationStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

const PlatformAnalytics = () => {
  const [totalUsers, setTotalUsers] = useState(0);
  const [roleDistribution, setRoleDistribution] = useState<RoleCount[]>([]);
  const [verificationStats, setVerificationStats] = useState<VerificationStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      // Fetch total users from profiles
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      setTotalUsers(userCount || 0);

      // Fetch role distribution
      const { data: rolesData } = await supabase
        .from("user_roles")
        .select("role");

      if (rolesData) {
        const roleCounts = rolesData.reduce((acc: Record<string, number>, item) => {
          acc[item.role] = (acc[item.role] || 0) + 1;
          return acc;
        }, {});

        const distribution: RoleCount[] = [
          { name: "Entrepreneurs", value: roleCounts["entrepreneur"] || 0, color: "hsl(var(--secondary))" },
          { name: "Investors", value: roleCounts["investor"] || 0, color: "hsl(var(--accent))" },
          { name: "Admins", value: roleCounts["admin"] || 0, color: "hsl(var(--primary))" },
        ];
        setRoleDistribution(distribution);
      }

      // Fetch verification stats
      const { data: verificationsData } = await supabase
        .from("verifications")
        .select("status");

      if (verificationsData) {
        const stats = verificationsData.reduce(
          (acc, item) => {
            acc.total++;
            if (item.status === "pending") acc.pending++;
            else if (item.status === "approved") acc.approved++;
            else if (item.status === "rejected") acc.rejected++;
            return acc;
          },
          { total: 0, pending: 0, approved: 0, rejected: 0 }
        );
        setVerificationStats(stats);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Real-time subscription for profiles
    const profilesChannel = supabase
      .channel("analytics-profiles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchAnalytics()
      )
      .subscribe();

    // Real-time subscription for user_roles
    const rolesChannel = supabase
      .channel("analytics-roles")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "user_roles" },
        () => fetchAnalytics()
      )
      .subscribe();

    // Real-time subscription for verifications
    const verificationsChannel = supabase
      .channel("analytics-verifications")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verifications" },
        () => fetchAnalytics()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(rolesChannel);
      supabase.removeChannel(verificationsChannel);
    };
  }, []);

  // Calculate approval rate
  const approvalRate = verificationStats.total > 0
    ? Math.round((verificationStats.approved / verificationStats.total) * 100)
    : 0;

  // Generate user growth data based on actual count (simulated trend)
  const userGrowthData = [
    { month: "Jan", users: Math.round(totalUsers * 0.2) },
    { month: "Feb", users: Math.round(totalUsers * 0.35) },
    { month: "Mar", users: Math.round(totalUsers * 0.5) },
    { month: "Apr", users: Math.round(totalUsers * 0.65) },
    { month: "May", users: Math.round(totalUsers * 0.8) },
    { month: "Jun", users: totalUsers },
  ];

  // Verification activity data
  const verificationActivityData = [
    { status: "Pending", count: verificationStats.pending },
    { status: "Approved", count: verificationStats.approved },
    { status: "Rejected", count: verificationStats.rejected },
  ];

  return (
    <DashboardLayout title="Platform Analytics" subtitle="Monitor platform performance and metrics" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={loading ? "..." : totalUsers.toLocaleString()}
            icon={Users}
            variant="primary"
          />
          <StatCard
            title="Verifications"
            value={loading ? "..." : verificationStats.total.toLocaleString()}
            icon={FileCheck}
            variant="secondary"
          />
          <StatCard
            title="Approval Rate"
            value={loading ? "..." : `${approvalRate}%`}
            icon={CheckCircle}
            variant="accent"
          />
          <StatCard
            title="Pending Reviews"
            value={loading ? "..." : verificationStats.pending.toLocaleString()}
            icon={Eye}
            variant="primary"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                User Growth
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={userGrowthData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="users" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5 text-secondary" />
                Verification Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={verificationActivityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="status" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>User Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={roleDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {roleDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-4">
                {roleDistribution.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-sm text-muted-foreground">{item.name} ({item.value})</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Platform Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Total Users Registered", value: totalUsers.toLocaleString(), change: null },
                  { label: "Entrepreneurs", value: roleDistribution.find(r => r.name === "Entrepreneurs")?.value.toLocaleString() || "0", change: null },
                  { label: "Investors", value: roleDistribution.find(r => r.name === "Investors")?.value.toLocaleString() || "0", change: null },
                  { label: "Verification Approval Rate", value: `${approvalRate}%`, change: approvalRate > 50 ? { value: approvalRate, positive: true } : { value: 100 - approvalRate, positive: false } },
                  { label: "Pending Verifications", value: verificationStats.pending.toLocaleString(), change: verificationStats.pending > 0 ? { value: verificationStats.pending, positive: false } : null },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{loading ? "..." : metric.value}</span>
                      {metric.change && (
                        <div className={`flex items-center gap-1 text-sm ${metric.change.positive ? "text-green-500" : "text-red-500"}`}>
                          {metric.change.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        </div>
                      )}
                    </div>
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

export default PlatformAnalytics;
