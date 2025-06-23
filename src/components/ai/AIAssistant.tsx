
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Brain, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const AIAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const { toast } = useToast();

  const handleAIQuery = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    console.log("AI Query:", query);

    // Simulate AI response - in production, this would call your AI service
    setTimeout(() => {
      setResponse(`Based on your query "${query}", here are my recommendations:

1. For curtain measurements, I suggest adding 15cm to each side for proper coverage
2. Consider using blackout lining for bedroom installations
3. Wave heading works best with modern fabrics like linen and cotton blends
4. Current fabric trending: Navy velvet and natural linen textures

Would you like me to auto-generate a quote with these specifications?`);
      setIsLoading(false);
      
      toast({
        title: "AI Assistant",
        description: "Recommendations generated successfully!",
      });
    }, 2000);
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
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Ask me anything about:</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              • Fabric recommendations & measurements<br/>
              • Pricing calculations & margins<br/>
              • Client follow-ups & hot leads<br/>
              • Inventory management & restocking<br/>
              • Workshop scheduling & work orders
            </CardContent>
          </Card>
          
          <div className="space-y-3">
            <Textarea
              placeholder="e.g., 'What's the best fabric for a bedroom with large windows?' or 'Calculate quote for 3x2m curtains with blackout lining'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={3}
            />
            
            <Button 
              onClick={handleAIQuery} 
              disabled={isLoading || !query.trim()}
              className="w-full"
            >
              {isLoading ? (
                "Thinking..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Get AI Recommendations
                </>
              )}
            </Button>
          </div>
          
          {response && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center">
                  <Brain className="mr-2 h-4 w-4" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm whitespace-pre-line">
                {response}
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
