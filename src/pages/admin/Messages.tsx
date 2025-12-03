import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, Send, Star, Trash2, Archive, Reply } from "lucide-react";
import { cn } from "@/lib/utils";

const mockMessages = [
  { id: 1, from: "John Doe", subject: "Platform Feedback", preview: "I wanted to share some thoughts about...", date: "2h ago", read: false, starred: true },
  { id: 2, from: "Sarah Smith", subject: "Verification Issue", preview: "I'm having trouble with my verification...", date: "5h ago", read: false, starred: false },
  { id: 3, from: "Mike Johnson", subject: "Investment Question", preview: "Can you help me understand how...", date: "1d ago", read: true, starred: false },
  { id: 4, from: "Emily Brown", subject: "Account Help", preview: "I need assistance with my account...", date: "2d ago", read: true, starred: true },
  { id: 5, from: "David Wilson", subject: "Feature Request", preview: "It would be great if you could add...", date: "3d ago", read: true, starred: false },
];

const Messages = () => {
  const [selectedMessage, setSelectedMessage] = useState(mockMessages[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [replyText, setReplyText] = useState("");

  const filteredMessages = mockMessages.filter((m) =>
    m.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout title="Messages" subtitle="Manage platform communications" userRole="admin">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-220px)]">
        {/* Message List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b">
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
          <ScrollArea className="h-[calc(100%-73px)]">
            <div className="divide-y">
              {filteredMessages.map((message) => (
                <div
                  key={message.id}
                  onClick={() => setSelectedMessage(message)}
                  className={cn(
                    "p-4 cursor-pointer hover:bg-muted/50 transition-colors",
                    selectedMessage?.id === message.id && "bg-muted",
                    !message.read && "bg-primary/5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn("font-medium truncate", !message.read && "font-semibold")}>
                          {message.from}
                        </span>
                        {!message.read && (
                          <Badge variant="default" className="h-2 w-2 p-0 rounded-full" />
                        )}
                      </div>
                      <p className={cn("text-sm truncate", !message.read ? "text-foreground" : "text-muted-foreground")}>
                        {message.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{message.preview}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{message.date}</span>
                      {message.starred && <Star className="h-4 w-4 text-amber-500 fill-amber-500" />}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        {/* Message Detail */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <div className="flex flex-col h-full">
              <div className="p-6 border-b">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedMessage.subject}</h2>
                    <p className="text-muted-foreground">From: {selectedMessage.from}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon">
                      <Star className={cn("h-5 w-5", selectedMessage.starred && "text-amber-500 fill-amber-500")} />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Archive className="h-5 w-5" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <p className="text-sm text-muted-foreground mb-2">{selectedMessage.date}</p>
                    <p>
                      Hello Admin,
                      <br /><br />
                      {selectedMessage.preview} This is a detailed message content that would typically contain more information about the user's query or feedback. The platform has been very helpful and I have some suggestions for improvements.
                      <br /><br />
                      Looking forward to your response.
                      <br /><br />
                      Best regards,
                      <br />
                      {selectedMessage.from}
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
                  <Button variant="outline">
                    <Reply className="h-4 w-4 mr-2" /> Quick Reply
                  </Button>
                  <Button>
                    <Send className="h-4 w-4 mr-2" /> Send Reply
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a message to view
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Messages;
