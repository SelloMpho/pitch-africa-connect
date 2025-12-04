import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Flag, Eye, Ban, CheckCircle, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Report {
  id: string;
  reporter_id: string;
  reporter_name: string;
  reported_entity: string;
  reported_user_id: string | null;
  type: string;
  severity: string;
  status: string;
  description: string | null;
  resolution_notes: string | null;
  resolved_at: string | null;
  resolved_by: string | null;
  created_at: string;
  updated_at: string;
}

interface ReportStats {
  critical: number;
  open: number;
  investigating: number;
  resolved: number;
}

const ReportsFraud = () => {
  const [activeTab, setActiveTab] = useState("open");
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<ReportStats>({ critical: 0, open: 0, investigating: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReports(data || []);

      // Calculate stats
      const newStats = (data || []).reduce(
        (acc, report) => {
          if (report.severity === "critical") acc.critical++;
          if (report.status === "open") acc.open++;
          if (report.status === "investigating") acc.investigating++;
          if (report.status === "resolved") acc.resolved++;
          return acc;
        },
        { critical: 0, open: 0, investigating: 0, resolved: 0 }
      );
      setStats(newStats);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();

    // Real-time subscription
    const channel = supabase
      .channel("reports-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => fetchReports()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateReportStatus = async (reportId: string, newStatus: string) => {
    try {
      const updateData: Record<string, unknown> = { status: newStatus };
      
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from("reports")
        .update(updateData)
        .eq("id", reportId);

      if (error) throw error;

      toast({
        title: "Report Updated",
        description: `Report status changed to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating report:", error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      case "high": return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>;
      case "medium": return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "resolved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Resolved</Badge>;
      case "dismissed": return <Badge className="bg-muted text-muted-foreground">Dismissed</Badge>;
      case "investigating": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Investigating</Badge>;
      default: return <Badge variant="outline" className="border-amber-500/50 text-amber-500">Open</Badge>;
    }
  };

  const filteredReports = reports.filter((r) => 
    activeTab === "all" ? true : r.status === activeTab
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <DashboardLayout title="Reports & Fraud" subtitle="Monitor and handle platform reports" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-red-500">{loading ? "..." : stats.critical}</p>
                </div>
                <AlertTriangle className="h-10 w-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Open Reports</p>
                  <p className="text-3xl font-bold text-orange-500">{loading ? "..." : stats.open}</p>
                </div>
                <Flag className="h-10 w-10 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Investigating</p>
                  <p className="text-3xl font-bold text-blue-500">{loading ? "..." : stats.investigating}</p>
                </div>
                <Eye className="h-10 w-10 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                  <p className="text-3xl font-bold text-green-500">{loading ? "..." : stats.resolved}</p>
                </div>
                <Shield className="h-10 w-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="open">Open</TabsTrigger>
            <TabsTrigger value="investigating">Investigating</TabsTrigger>
            <TabsTrigger value="resolved">Resolved</TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {loading ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    Loading reports...
                  </CardContent>
                </Card>
              ) : filteredReports.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-muted-foreground">
                    No {activeTab === "all" ? "" : activeTab} reports found
                  </CardContent>
                </Card>
              ) : (
                filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-destructive/10">
                            <Flag className="h-6 w-6 text-destructive" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{report.reported_entity}</h3>
                            <p className="text-sm text-muted-foreground">Reported by: {report.reporter_name}</p>
                            {report.description && (
                              <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{report.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Type</p>
                            <p className="text-sm font-medium capitalize">{report.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Date</p>
                            <p className="text-sm font-medium">{formatDate(report.created_at)}</p>
                          </div>
                          {getSeverityBadge(report.severity)}
                          {getStatusBadge(report.status)}
                          <div className="flex gap-2">
                            {report.status === "open" && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => updateReportStatus(report.id, "investigating")}
                              >
                                <Search className="h-4 w-4 mr-1" /> Investigate
                              </Button>
                            )}
                            {report.status !== "resolved" && report.status !== "dismissed" && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-500 border-red-500/50"
                                  onClick={() => updateReportStatus(report.id, "dismissed")}
                                >
                                  <Ban className="h-4 w-4 mr-1" /> Dismiss
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-500 border-green-500/50"
                                  onClick={() => updateReportStatus(report.id, "resolved")}
                                >
                                  <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportsFraud;