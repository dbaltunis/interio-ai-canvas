
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Send, Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface AIAssistantProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  initialPrompt?: string;
}

export const AIAssistant = ({ open: externalOpen, onOpenChange: externalOnOpenChange, initialPrompt }: AIAssistantProps = {}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const { toast } = useToast();

  // Use external control if provided, otherwise use internal state
  const isOpen = externalOpen !== undefined ? externalOpen : internalOpen;
  const setIsOpen = externalOnOpenChange || setInternalOpen;

  // Handle initial prompt
  useEffect(() => {
    if (initialPrompt && isOpen) {
      setQuery(initialPrompt);
      // Auto-send if there's an initial prompt
      setTimeout(() => {
        handleAIQuery(initialPrompt);
      }, 500);
    }
  }, [initialPrompt, isOpen]);

  const handleAIQuery = async (messageText?: string) => {
    const userMessage = messageText || query;
    if (!userMessage.trim()) return;

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
        <Button variant="outline" size="sm" className="gap-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">Setup Guide</span>
          <span className="sm:hidden">Help</span>
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle className="text-lg">InterioApp Setup Guide</DialogTitle>
              <p className="text-xs text-muted-foreground mt-1">Learn how to use InterioApp features</p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Conversation History */}
          {messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-4 rounded-2xl ${
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-br-sm' 
                        : 'bg-muted rounded-bl-sm'
                    }`}
                  >
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 mb-2">
                        <Brain className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Setup Guide</span>
                      </div>
                    )}
                    <p className="text-sm whitespace-pre-line leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  How can I help you today?
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">📦</span>
                  <span>How to add products (curtains, blinds, wallpaper, hardware)</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">🛒</span>
                  <span>Connecting & syncing your Shopify store</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">📋</span>
                  <span>Creating CSV files for bulk product upload</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✨</span>
                  <span>Setting up your first order or project</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">📅</span>
                  <span>Calendar integration & appointment booking</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
        
        <div className="px-6 pb-6 pt-4 border-t bg-background">
          <div className="space-y-3">
            <Textarea
              placeholder="Ask me how to use InterioApp features..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleAIQuery();
                }
              }}
              rows={2}
              disabled={isLoading}
              className="resize-none"
            />
            
            <Button 
              onClick={() => handleAIQuery()} 
              disabled={isLoading || !query.trim()}
              className="w-full gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Thinking...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Message
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
