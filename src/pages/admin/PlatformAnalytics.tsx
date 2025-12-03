import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatCard from "@/components/ui/stat-card";
import { Users, TrendingUp, DollarSign, Eye, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

const userGrowthData = [
  { month: "Jan", users: 120 },
  { month: "Feb", users: 180 },
  { month: "Mar", users: 250 },
  { month: "Apr", users: 310 },
  { month: "May", users: 420 },
  { month: "Jun", users: 580 },
];

const engagementData = [
  { day: "Mon", views: 450, messages: 120 },
  { day: "Tue", views: 520, messages: 150 },
  { day: "Wed", views: 480, messages: 130 },
  { day: "Thu", views: 600, messages: 180 },
  { day: "Fri", views: 550, messages: 160 },
  { day: "Sat", views: 300, messages: 80 },
  { day: "Sun", views: 280, messages: 70 },
];

const roleDistribution = [
  { name: "Entrepreneurs", value: 65, color: "hsl(var(--secondary))" },
  { name: "Investors", value: 30, color: "hsl(var(--accent))" },
  { name: "Admins", value: 5, color: "hsl(var(--primary))" },
];

const PlatformAnalytics = () => {
  return (
    <DashboardLayout title="Platform Analytics" subtitle="Monitor platform performance and metrics" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value="1,248"
            icon={Users}
            trend={{ value: 12.5, isPositive: true }}
            variant="primary"
          />
          <StatCard
            title="Active Sessions"
            value="342"
            icon={Eye}
            trend={{ value: 8.2, isPositive: true }}
            variant="secondary"
          />
          <StatCard
            title="Conversion Rate"
            value="24.8%"
            icon={TrendingUp}
            trend={{ value: 3.1, isPositive: true }}
            variant="accent"
          />
          <StatCard
            title="Revenue"
            value="R 125,400"
            icon={DollarSign}
            trend={{ value: 2.4, isPositive: false }}
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
                <Eye className="h-5 w-5 text-secondary" />
                Weekly Engagement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={engagementData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="day" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }} 
                  />
                  <Bar dataKey="views" fill="hsl(var(--secondary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="messages" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
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
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Performing Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { label: "Profile Completion Rate", value: "78%", change: 5.2, positive: true },
                  { label: "Average Session Duration", value: "12m 34s", change: 2.8, positive: true },
                  { label: "Pitch View Rate", value: "156/day", change: 12.1, positive: true },
                  { label: "Message Response Time", value: "2.4h", change: 8.5, positive: false },
                  { label: "Successful Connections", value: "89", change: 15.3, positive: true },
                ].map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                    <span className="font-medium">{metric.label}</span>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">{metric.value}</span>
                      <div className={`flex items-center gap-1 text-sm ${metric.positive ? "text-green-500" : "text-red-500"}`}>
                        {metric.positive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                        {metric.change}%
                      </div>
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
