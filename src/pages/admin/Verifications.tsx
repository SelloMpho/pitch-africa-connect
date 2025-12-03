import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, FileText, Building2, User } from "lucide-react";

const mockVerifications = [
  { id: 1, name: "TechStart SA", type: "company", status: "pending", submitted: "2024-01-15", documents: 3 },
  { id: 2, name: "John Doe", type: "investor", status: "pending", submitted: "2024-01-14", documents: 2 },
  { id: 3, name: "GreenEnergy Co", type: "company", status: "approved", submitted: "2024-01-10", documents: 4 },
  { id: 4, name: "Sarah Smith", type: "investor", status: "rejected", submitted: "2024-01-08", documents: 1 },
];

const Verifications = () => {
  const [activeTab, setActiveTab] = useState("pending");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="border-amber-500/50 text-amber-500">Pending</Badge>;
    }
  };

  const filteredVerifications = mockVerifications.filter((v) => 
    activeTab === "all" ? true : v.status === activeTab
  );

  return (
    <DashboardLayout title="Verifications" subtitle="Review and manage user verifications" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-amber-500">12</p>
                </div>
                <Clock className="h-10 w-10 text-amber-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Approved</p>
                  <p className="text-3xl font-bold text-green-500">48</p>
                </div>
                <CheckCircle className="h-10 w-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Rejected</p>
                  <p className="text-3xl font-bold text-red-500">5</p>
                </div>
                <XCircle className="h-10 w-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-3xl font-bold text-primary">65</p>
                </div>
                <FileText className="h-10 w-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            <div className="space-y-4">
              {filteredVerifications.map((verification) => (
                <Card key={verification.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${verification.type === "company" ? "bg-secondary/10" : "bg-accent/10"}`}>
                          {verification.type === "company" ? (
                            <Building2 className="h-6 w-6 text-secondary" />
                          ) : (
                            <User className="h-6 w-6 text-accent" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{verification.name}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{verification.type} Verification</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Submitted</p>
                          <p className="text-sm font-medium">{verification.submitted}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Documents</p>
                          <p className="text-sm font-medium">{verification.documents}</p>
                        </div>
                        {getStatusBadge(verification.status)}
                        {verification.status === "pending" && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="text-green-500 border-green-500/50">
                              <CheckCircle className="h-4 w-4 mr-1" /> Approve
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-500 border-red-500/50">
                              <XCircle className="h-4 w-4 mr-1" /> Reject
                            </Button>
                          </div>
                        )}
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

export default Verifications;
