import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Star, Trash2, Archive, Reply, Loader2, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  recipient_id: string | null;
  subject: string;
  content: string;
  read: boolean;
  starred: boolean;
  archived: boolean;
  created_at: string;
}

interface VerifiedUser {
  user_id: string;
  name: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [verifiedUsers, setVerifiedUsers] = useState<VerifiedUser[]>([]);
  const [newMessageMode, setNewMessageMode] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newContent, setNewContent] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("archived", false)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchVerifiedUsers = async () => {
    try {
      // Get verified users from verifications table
      const { data: verifications, error } = await supabase
        .from("verifications")
        .select("user_id, name")
        .eq("status", "approved");

      if (error) throw error;
      setVerifiedUsers(verifications || []);
    } catch (error) {
      console.error("Error fetching verified users:", error);
    }
  };

  useEffect(() => {
    fetchMessages();
    fetchVerifiedUsers();

    // Set up real-time subscription
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [payload.new as Message, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setMessages((prev) =>
              prev.map((msg) =>
                msg.id === payload.new.id ? (payload.new as Message) : msg
              )
            );
            if (selectedMessage?.id === payload.new.id) {
              setSelectedMessage(payload.new as Message);
            }
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) =>
              prev.filter((msg) => msg.id !== payload.old.id)
            );
            if (selectedMessage?.id === payload.old.id) {
              setSelectedMessage(null);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (hours < 1) return "Just now";
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const handleSelectMessage = async (message: Message) => {
    setSelectedMessage(message);
    setNewMessageMode(false);

    // Mark as read if not already
    if (!message.read) {
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("id", message.id);
    }
  };

  const handleToggleStar = async (message: Message) => {
    try {
      await supabase
        .from("messages")
        .update({ starred: !message.starred })
        .eq("id", message.id);
    } catch (error) {
      console.error("Error toggling star:", error);
    }
  };

  const handleArchive = async (message: Message) => {
    try {
      await supabase
        .from("messages")
        .update({ archived: true })
        .eq("id", message.id);
      toast({ title: "Message archived" });
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error archiving message:", error);
    }
  };

  const handleDelete = async (message: Message) => {
    try {
      await supabase.from("messages").delete().eq("id", message.id);
      toast({ title: "Message deleted" });
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return;

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        sender_name: "Admin",
        recipient_id: selectedMessage.sender_id,
        subject: `Re: ${selectedMessage.subject}`,
        content: replyText,
      });

      if (error) throw error;

      toast({ title: "Reply sent successfully" });
      setReplyText("");
    } catch (error) {
      console.error("Error sending reply:", error);
      toast({
        title: "Error",
        description: "Failed to send reply",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleSendNewMessage = async () => {
    if (!selectedRecipient || !newSubject.trim() || !newContent.trim()) {
      toast({
        title: "Missing fields",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setSending(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase.from("messages").insert({
        sender_id: user.id,
        sender_name: "Admin",
        recipient_id: selectedRecipient,
        subject: newSubject,
        content: newContent,
      });

      if (error) throw error;

      toast({ title: "Message sent successfully" });
      setNewMessageMode(false);
      setNewSubject("");
      setNewContent("");
      setSelectedRecipient("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const filteredMessages = messages.filter(
    (m) =>
      m.sender_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const unreadCount = messages.filter((m) => !m.read).length;

  if (loading) {
    return (
      <DashboardLayout
        title="Messages"
        subtitle="Manage platform communications"
        userRole="admin"
      >
        <div className="flex items-center justify-center h-[calc(100vh-220px)]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Messages"
      subtitle="Manage platform communications"
      userRole="admin"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-medium">Inbox</span>
                {unreadCount > 0 && (
                  <Badge variant="default">{unreadCount}</Badge>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setNewMessageMode(true);
                  setSelectedMessage(null);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                New
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <ScrollArea className="h-[calc(100%-130px)]">
            <div className="divide-y">
              {filteredMessages.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No messages found
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={cn(
                      "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                      selectedMessage?.id === message.id && "bg-muted",
                      !message.read && "bg-primary/5"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "font-medium truncate",
                              !message.read && "font-semibold"
                            )}
                          >
                            {message.sender_name}
                          </span>
                          {!message.read && (
                            <Badge
                              variant="default"
                              className="h-2 w-2 p-0 rounded-full"
                            />
                          )}
                        </div>
                        <p
                          className={cn(
                            "text-sm truncate",
                            !message.read
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {message.subject}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {message.content.substring(0, 50)}...
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(message.created_at)}
                        </span>
                        {message.starred && (
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </Card>

        {/* Message Detail / New Message */}
        <Card className="lg:col-span-2">
          {newMessageMode ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold">New Message</h2>
                <p className="text-muted-foreground">
                  Send a message to a verified user
                </p>
              </div>
              <div className="flex-1 p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recipient</label>
                  <Select
                    value={selectedRecipient}
                    onValueChange={setSelectedRecipient}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a verified user" />
                    </SelectTrigger>
                    <SelectContent>
                      {verifiedUsers.length === 0 ? (
                        <SelectItem value="none" disabled>
                          No verified users found
                        </SelectItem>
                      ) : (
                        verifiedUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Input
                    placeholder="Enter subject..."
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Message</label>
                  <Textarea
                    placeholder="Type your message..."
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    className="min-h-[200px]"
                  />
                </div>
              </div>
              <div className="p-4 border-t flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setNewMessageMode(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSendNewMessage} disabled={sending}>
                  {sending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Send Message
                </Button>
              </div>
            </div>
          ) : selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedMessage.subject}
                    </h2>
                    <p className="text-muted-foreground">
                      From: {selectedMessage.sender_name}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleStar(selectedMessage)}
                    >
                      <Star
                        className={cn(
                          "h-5 w-5",
                          selectedMessage.starred &&
                            "text-amber-500 fill-amber-500"
                        )}
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleArchive(selectedMessage)}
                    >
                      <Archive className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(selectedMessage)}
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {formatDate(selectedMessage.created_at)}
                    </p>
                    <p className="whitespace-pre-wrap">
                      {selectedMessage.content}
                    </p>
                  </div>
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <div className="flex gap-4">
                  <Textarea
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="min-h-[80px]"
                  />
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <Button onClick={handleSendReply} disabled={sending}>
                    {sending ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a message to view or compose a new message
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
