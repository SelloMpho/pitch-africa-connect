import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Image, Video, Plus, Edit, Trash2, Eye, Search, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Content {
  id: string;
  title: string;
  type: string;
  status: string;
  views: number;
  content_body: string | null;
  created_at: string;
}

const ContentManagement = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingContent, setEditingContent] = useState<Content | null>(null);
  const [formData, setFormData] = useState({ title: "", type: "article", content_body: "" });
  const { toast } = useToast();

  useEffect(() => {
    fetchContent();

    const channel = supabase
      .channel('content-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'content' }, () => {
        fetchContent();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('content')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: "Error fetching content", description: error.message, variant: "destructive" });
    } else {
      setContent(data || []);
    }
    setLoading(false);
  };

  const handleCreate = async () => {
    const { error } = await supabase.from('content').insert({
      title: formData.title,
      type: formData.type,
      content_body: formData.content_body,
      status: 'draft'
    });

    if (error) {
      toast({ title: "Error creating content", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content created successfully" });
      setIsCreateOpen(false);
      setFormData({ title: "", type: "article", content_body: "" });
    }
  };

  const handleUpdate = async () => {
    if (!editingContent) return;

    const { error } = await supabase
      .from('content')
      .update({ title: formData.title, type: formData.type, content_body: formData.content_body })
      .eq('id', editingContent.id);

    if (error) {
      toast({ title: "Error updating content", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content updated successfully" });
      setIsEditOpen(false);
      setEditingContent(null);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('content').delete().eq('id', id);

    if (error) {
      toast({ title: "Error deleting content", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Content deleted successfully" });
    }
  };

  const handlePublish = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('content').update({ status: newStatus }).eq('id', id);

    if (error) {
      toast({ title: "Error updating status", description: error.message, variant: "destructive" });
    } else {
      toast({ title: `Content ${newStatus === 'published' ? 'published' : 'unpublished'}` });
    }
  };

  const openEdit = (item: Content) => {
    setEditingContent(item);
    setFormData({ title: item.title, type: item.type, content_body: item.content_body || "" });
    setIsEditOpen(true);
  };

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

  const filteredContent = content.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    articles: content.filter(c => c.type === 'article').length,
    images: content.filter(c => c.type === 'image').length,
    videos: content.filter(c => c.type === 'video').length,
    totalViews: content.reduce((sum, c) => sum + c.views, 0)
  };

  if (loading) {
    return (
      <DashboardLayout title="Content Management" subtitle="Manage platform content and resources" userRole="admin">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Content Management" subtitle="Manage platform content and resources" userRole="admin">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Articles</p>
                  <p className="text-3xl font-bold text-blue-500">{stats.articles}</p>
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
                  <p className="text-3xl font-bold text-green-500">{stats.images}</p>
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
                  <p className="text-3xl font-bold text-red-500">{stats.videos}</p>
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
                  <p className="text-3xl font-bold text-primary">{stats.totalViews.toLocaleString()}</p>
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
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" /> Create Content
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Content</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Title</Label>
                  <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div>
                  <Label>Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="article">Article</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="video">Video</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Content</Label>
                  <Textarea value={formData.content_body} onChange={(e) => setFormData({ ...formData, content_body: e.target.value })} rows={4} />
                </div>
                <Button onClick={handleCreate} className="w-full">Create</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Content</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <Label>Title</Label>
                <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Content</Label>
                <Textarea value={formData.content_body} onChange={(e) => setFormData({ ...formData, content_body: e.target.value })} rows={4} />
              </div>
              <Button onClick={handleUpdate} className="w-full">Update</Button>
            </div>
          </DialogContent>
        </Dialog>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All Content</TabsTrigger>
            <TabsTrigger value="articles">Articles</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          {["all", "articles", "images", "videos"].map((tab) => (
            <TabsContent key={tab} value={tab} className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredContent
                  .filter((c) => tab === "all" || c.type === tab.slice(0, -1))
                  .map((item) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="p-2 rounded-lg bg-muted">
                            {getTypeIcon(item.type)}
                          </div>
                          {getStatusBadge(item.status)}
                        </div>
                        <CardTitle className="text-lg mt-3">{item.title}</CardTitle>
                        <CardDescription className="capitalize">{item.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <span>{item.views.toLocaleString()} views</span>
                          <span>{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handlePublish(item.id, item.status)}>
                            <Eye className="h-4 w-4 mr-1" /> {item.status === 'published' ? 'Unpublish' : 'Publish'}
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => openEdit(item)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                {filteredContent.filter((c) => tab === "all" || c.type === tab.slice(0, -1)).length === 0 && (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No content found. Create your first content item!
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ContentManagement;
