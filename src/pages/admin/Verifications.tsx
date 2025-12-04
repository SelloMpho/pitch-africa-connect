import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Clock, FileText, Building2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Verification {
  id: string;
  user_id: string;
  name: string;
  type: "company" | "investor";
  status: "pending" | "approved" | "rejected";
  documents_count: number;
  submitted_at: string;
  reviewed_at: string | null;
  rejection_reason: string | null;
}

interface VerificationStats {
  pending: number;
  approved: number;
  rejected: number;
  total: number;
}

const Verifications = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [stats, setStats] = useState<VerificationStats>({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVerifications = async () => {
    const { data, error } = await supabase
      .from("verifications")
      .select("*")
      .order("submitted_at", { ascending: false });

    if (error) {
      console.error("Error fetching verifications:", error);
      toast({ title: "Error", description: "Failed to load verifications", variant: "destructive" });
      return;
    }

    const typedData = (data || []) as Verification[];
    setVerifications(typedData);
    
    // Calculate stats
    const pending = typedData.filter(v => v.status === "pending").length;
    const approved = typedData.filter(v => v.status === "approved").length;
    const rejected = typedData.filter(v => v.status === "rejected").length;
    setStats({ pending, approved, rejected, total: typedData.length });
    setLoading(false);
  };

  useEffect(() => {
    fetchVerifications();

    // Set up realtime subscription
    const channel = supabase
      .channel("verifications-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "verifications" },
        () => {
          fetchVerifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("verifications")
      .update({ 
        status: "approved", 
        reviewed_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to approve verification", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Verification approved" });
  };

  const handleReject = async (id: string) => {
    const { error } = await supabase
      .from("verifications")
      .update({ 
        status: "rejected", 
        reviewed_at: new Date().toISOString() 
      })
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to reject verification", variant: "destructive" });
      return;
    }
    toast({ title: "Success", description: "Verification rejected" });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Approved</Badge>;
      case "rejected": return <Badge variant="destructive">Rejected</Badge>;
      default: return <Badge variant="outline" className="border-amber-500/50 text-amber-500">Pending</Badge>;
    }
  };

  const filteredVerifications = verifications.filter((v) => 
    activeTab === "all" ? true : v.status === activeTab
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-ZA", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  return (
    <DashboardLayout title="Verifications" subtitle="Review and manage user verifications" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
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
                  <p className="text-3xl font-bold text-green-500">{stats.approved}</p>
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
                  <p className="text-3xl font-bold text-red-500">{stats.rejected}</p>
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
                  <p className="text-3xl font-bold text-primary">{stats.total}</p>
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
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading verifications...</div>
            ) : filteredVerifications.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No verifications found</div>
            ) : (
              <div className="space-y-4">
                {filteredVerifications.map((verification) => (
                  <Card key={verification.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between flex-wrap gap-4">
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
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Submitted</p>
                            <p className="text-sm font-medium">{formatDate(verification.submitted_at)}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Documents</p>
                            <p className="text-sm font-medium">{verification.documents_count}</p>
                          </div>
                          {getStatusBadge(verification.status)}
                          {verification.status === "pending" && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-green-500 border-green-500/50 hover:bg-green-500/10"
                                onClick={() => handleApprove(verification.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                className="text-red-500 border-red-500/50 hover:bg-red-500/10"
                                onClick={() => handleReject(verification.id)}
                              >
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
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Verifications;
