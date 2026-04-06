import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { MessageSquare, Send, Clock, CheckCircle2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

const Support = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const { data: pastMessages, refetch } = useQuery({
    queryKey: ["support-messages", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("support_messages")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !message.trim()) return;

    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user.id,
      subject: subject.trim(),
      message: message.trim(),
    });
    setSending(false);

    if (error) {
      toast({ title: "Error", description: "Failed to send message. Please try again.", variant: "destructive" });
    } else {
      toast({ title: "Message Sent!", description: "We'll get back to you soon." });
      setSubject("");
      setMessage("");
      refetch();
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl md:text-3xl font-bold flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-primary" />
          Support & Feedback
        </h1>
        <p className="text-muted-foreground mt-1">Have an issue or suggestion? Let us know and we'll look into it.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Send a Message</CardTitle>
          <CardDescription>Describe your issue or share your feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                placeholder="e.g. Bug report, Feature request, Payment issue..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                maxLength={150}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Tell us what happened or what you'd like to see..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={2000}
                rows={5}
                required
              />
            </div>
            <Button type="submit" disabled={sending} className="gap-2">
              <Send className="w-4 h-4" />
              {sending ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {pastMessages && pastMessages.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display text-lg font-semibold">Your Previous Messages</h2>
          {pastMessages.map((msg: any) => (
            <Card key={msg.id} className="bg-muted/30">
              <CardContent className="p-4 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-sm">{msg.subject}</p>
                  <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                    msg.status === "open"
                      ? "bg-yellow-500/10 text-yellow-600"
                      : "bg-green-500/10 text-green-600"
                  }`}>
                    {msg.status === "open" ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                    {msg.status}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">{msg.message}</p>
                <p className="text-xs text-muted-foreground/60">
                  {new Date(msg.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Support;
