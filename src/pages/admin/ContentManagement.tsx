import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { FileText, Image, Video, Plus, Edit, Trash2, Eye, Search } from "lucide-react";

const mockContent = [
  { id: 1, title: "Getting Started Guide", type: "article", status: "published", views: 1250, date: "2024-01-15" },
  { id: 2, title: "Investment Tips", type: "article", status: "draft", views: 0, date: "2024-01-14" },
  { id: 3, title: "Platform Tutorial", type: "video", status: "published", views: 890, date: "2024-01-10" },
  { id: 4, title: "Success Stories Banner", type: "image", status: "published", views: 2100, date: "2024-01-08" },
];

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="h-5 w-5 text-red-500" />;
      case "image": return <Image className="h-5 w-5 text-green-500" />;
      default: return <FileText className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Published</Badge>;
      default: return <Badge variant="outline">Draft</Badge>;
    }
  };

  const filteredContent = mockContent.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Content Management" subtitle="Manage platform content and resources" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Articles</p>
                  <p className="text-3xl font-bold text-blue-500">24</p>
                </div>
                <FileText className="h-10 w-10 text-blue-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Images</p>
                  <p className="text-3xl font-bold text-green-500">56</p>
                </div>
                <Image className="h-10 w-10 text-green-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-500/10 to-red-500/5 border-red-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Videos</p>
                  <p className="text-3xl font-bold text-red-500">12</p>
                </div>
                <Video className="h-10 w-10 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                  <p className="text-3xl font-bold text-primary">45.2K</p>
                </div>
                <Eye className="h-10 w-10 text-primary/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="gap-2">
            <Plus className="h-4 w-4" /> Create Content
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredContent.map((content) => (
                <Card key={content.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="p-2 rounded-lg bg-muted">
                        {getTypeIcon(content.type)}
                      </div>
                      {getStatusBadge(content.status)}
                    </div>
                    <CardTitle className="text-lg mt-3">{content.title}</CardTitle>
                    <CardDescription className="capitalize">{content.type}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{content.views.toLocaleString()} views</span>
                      <span>{content.date}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        <Edit className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button size="sm" variant="outline" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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

export default ContentManagement;
