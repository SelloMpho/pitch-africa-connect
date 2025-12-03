import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Shield, Flag, Eye, Ban, CheckCircle } from "lucide-react";

const mockReports = [
  { id: 1, reporter: "John Doe", reported: "Fake Startup Inc", type: "fraud", status: "open", date: "2024-01-15", severity: "high" },
  { id: 2, reporter: "Jane Smith", reported: "Scam Investor", type: "impersonation", status: "investigating", date: "2024-01-14", severity: "critical" },
  { id: 3, reporter: "Mike Johnson", reported: "Bad Actor LLC", type: "spam", status: "resolved", date: "2024-01-10", severity: "low" },
  { id: 4, reporter: "Sarah Williams", reported: "Misleading Co", type: "misleading", status: "open", date: "2024-01-08", severity: "medium" },
];

const ReportsFraud = () => {
  const [activeTab, setActiveTab] = useState("open");

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
      case "investigating": return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Investigating</Badge>;
      default: return <Badge variant="outline" className="border-amber-500/50 text-amber-500">Open</Badge>;
    }
  };

  const filteredReports = mockReports.filter((r) => 
    activeTab === "all" ? true : r.status === activeTab
  );

  return (
    <DashboardLayout title="Reports & Fraud" subtitle="Monitor and handle platform reports" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className="text-3xl font-bold text-red-500">3</p>
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
                  <p className="text-3xl font-bold text-orange-500">12</p>
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
                  <p className="text-3xl font-bold text-blue-500">5</p>
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
                  <p className="text-3xl font-bold text-green-500">48</p>
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
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4">
                        <div className="p-3 rounded-xl bg-destructive/10">
                          <Flag className="h-6 w-6 text-destructive" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{report.reported}</h3>
                          <p className="text-sm text-muted-foreground">Reported by: {report.reporter}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Type</p>
                          <p className="text-sm font-medium capitalize">{report.type}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Date</p>
                          <p className="text-sm font-medium">{report.date}</p>
                        </div>
                        {getSeverityBadge(report.severity)}
                        {getStatusBadge(report.status)}
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-1" /> Review
                          </Button>
                          {report.status !== "resolved" && (
                            <>
                              <Button size="sm" variant="outline" className="text-red-500 border-red-500/50">
                                <Ban className="h-4 w-4 mr-1" /> Ban User
                              </Button>
                              <Button size="sm" variant="outline" className="text-green-500 border-green-500/50">
                                <CheckCircle className="h-4 w-4 mr-1" /> Resolve
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ReportsFraud;
