import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Search, MoreHorizontal, UserCheck, UserX, Mail, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  full_name: string;
  company_name: string | null;
  location: string | null;
  created_at: string | null;
  role: string;
}

const UserManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    checkAuth();
    fetchUsers();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .single();

    if (roleData?.role !== "admin") {
      navigate("/auth");
    }
  };

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id, full_name, company_name, location, created_at");

    if (error) {
      toast({ title: "Error fetching users", variant: "destructive" });
      return;
    }

    const usersWithRoles = await Promise.all(
      (profiles || []).map(async (profile) => {
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", profile.id)
          .single();
        return { ...profile, role: roleData?.role || "unknown" };
      })
    );

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case "admin": return "destructive";
      case "investor": return "default";
      case "entrepreneur": return "secondary";
      default: return "outline";
    }
  };

  return (
    <DashboardLayout title="User Management" subtitle="Manage all platform users" userRole="admin">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name, company, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Export CSV</Button>
            <Button>Add User</Button>
          </div>
        </div>

        <div className="bg-card rounded-xl border shadow-sm overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>User</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">Loading users...</TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">No users found</TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id} className="hover:bg-muted/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-medium">{user.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.company_name || "-"}</TableCell>
                    <TableCell>
                      <Badge variant={getRoleBadgeVariant(user.role)} className="capitalize">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.location || "-"}</TableCell>
                    <TableCell>{user.created_at ? new Date(user.created_at).toLocaleDateString() : "-"}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem><UserCheck className="mr-2 h-4 w-4" /> Verify User</DropdownMenuItem>
                          <DropdownMenuItem><Mail className="mr-2 h-4 w-4" /> Send Email</DropdownMenuItem>
                          <DropdownMenuItem><UserX className="mr-2 h-4 w-4" /> Suspend</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UserManagement;
