
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  const handleAIQuery = async () => {
    if (!query.trim()) return;

    const userMessage = query;
    setQuery("");
    setIsLoading(true);

    // Add user message to conversation
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const { data, error } = await supabase.functions.invoke('ai-advisor', {
        body: { 
          message: userMessage,
          conversationHistory: messages
        }
      });

      if (error) throw error;

      // Add AI response to conversation
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);

      toast({
        title: "AI Assistant",
        description: "Response generated successfully!",
      });
    } catch (error: any) {
      console.error('AI query error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to get AI response",
        variant: "destructive"
      });
      // Remove the user message if the call failed
      setMessages(prev => prev.slice(0, -1));
      setQuery(userMessage); // Restore the query
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Brain className="mr-2 h-4 w-4" />
          AI Assistant
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Assistant - InterioApp</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Conversation History */}
          {messages.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-3 p-3 bg-muted/20 rounded-lg">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-lg ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-card border'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2 text-xs font-semibold">
                        <Brain className="h-3 w-3" />
                        AI Advisor
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {messages.length === 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">I can help you with:</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                • Shopify store setup & analytics<br/>
                • Marketing strategies & sales optimization<br/>
                • Inventory management & product recommendations<br/>
                • Business insights based on your data<br/>
                • Next steps for growing your store
              </CardContent>
            </Card>
          )}
          
          <div className="space-y-3">
            <Textarea
              placeholder="e.g., 'How can I get my first sale?' or 'What should I do after connecting my store?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAIQuery();
                }
              }}
              rows={3}
              disabled={isLoading}
            />
            
            <Button 
              onClick={handleAIQuery} 
              disabled={isLoading || !query.trim()}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Ask AI Advisor
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
