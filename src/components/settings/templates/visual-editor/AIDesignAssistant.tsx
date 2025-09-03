import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Wand2,
  Sparkles,
  Palette,
  Type,
  RotateCcw,
  Copy,
  Download,
  Settings,
  Zap,
  Crown
} from "lucide-react";
import { toast } from "sonner";

interface AIDesignAssistantProps {
  onApplyDesign: (designData: any) => void;
  currentBlocks: any[];
}

interface DesignSuggestion {
  id: string;
  name: string;
  description: string;
  category: 'color' | 'layout' | 'typography' | 'spacing';
  preview: any;
  premium?: boolean;
}

const designSuggestions: DesignSuggestion[] = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    description: 'Professional blue theme with clean typography',
    category: 'color',
    preview: { primary: '#3b82f6', secondary: '#1e40af', accent: '#60a5fa' }
  },
  {
    id: 'luxury-purple',
    name: 'Luxury Purple',
    description: 'Premium purple palette for high-end documents',
    category: 'color',
    preview: { primary: '#7c3aed', secondary: '#5b21b6', accent: '#a855f7' },
    premium: true
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh green theme for eco-friendly brands',
    category: 'color',
    preview: { primary: '#10b981', secondary: '#047857', accent: '#34d399' }
  },
  {
    id: 'compact-layout',
    name: 'Compact Layout',
    description: 'Space-efficient design for detailed quotes',
    category: 'layout',
    preview: { spacing: 'tight', density: 'high' }
  },
  {
    id: 'spacious-layout',
    name: 'Spacious Layout',
    description: 'Generous whitespace for premium feel',
    category: 'layout',
    preview: { spacing: 'wide', density: 'low' },
    premium: true
  },
  {
    id: 'modern-typography',
    name: 'Modern Typography',
    description: 'Clean, contemporary font styling',
    category: 'typography',
    preview: { fontSize: 'medium', fontWeight: 'normal', lineHeight: 'relaxed' }
  },
  {
    id: 'bold-typography',
    name: 'Bold Typography',
    description: 'Strong, impactful text styling',
    category: 'typography',
    preview: { fontSize: 'large', fontWeight: 'bold', lineHeight: 'tight' },
    premium: true
  }
];

export const AIDesignAssistant = ({ onApplyDesign, currentBlocks }: AIDesignAssistantProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [designPrompt, setDesignPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'suggestions' | 'prompt' | 'customize'>('suggestions');

  const handleApplySuggestion = (suggestion: DesignSuggestion) => {
    if (suggestion.premium) {
      toast("✨ Premium design applied!", {
        description: "This design is part of our premium collection."
      });
    } else {
      toast("🎨 Design applied successfully!");
    }

    // Apply the design suggestion to all relevant blocks
    const updatedBlocks = currentBlocks.map(block => {
      const updates: any = {};

      switch (suggestion.category) {
        case 'color':
          if (suggestion.preview.primary) {
            updates.style = {
              ...block.content?.style,
              backgroundColor: suggestion.preview.primary,
              borderColor: suggestion.preview.secondary,
              accentColor: suggestion.preview.accent
            };
          }
          break;
        case 'typography':
          updates.style = {
            ...block.content?.style,
            fontSize: suggestion.preview.fontSize === 'large' ? '18px' : '16px',
            fontWeight: suggestion.preview.fontWeight,
            lineHeight: suggestion.preview.lineHeight === 'relaxed' ? '1.6' : '1.4'
          };
          break;
        case 'layout':
          updates.style = {
            ...block.content?.style,
            padding: suggestion.preview.spacing === 'wide' ? '24px' : '16px',
            margin: suggestion.preview.spacing === 'wide' ? '16px' : '8px'
          };
          break;
      }

      return {
        ...block,
        content: {
          ...block.content,
          ...updates
        }
      };
    });

    onApplyDesign({ blocks: updatedBlocks, theme: suggestion.preview });
  };

  const handleGenerateFromPrompt = async () => {
    if (!designPrompt.trim()) return;

    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Generate design based on prompt
    const generatedDesign = {
      primary: '#' + Math.floor(Math.random()*16777215).toString(16),
      secondary: '#' + Math.floor(Math.random()*16777215).toString(16),
      accent: '#' + Math.floor(Math.random()*16777215).toString(16)
    };

    const updatedBlocks = currentBlocks.map(block => ({
      ...block,
      content: {
        ...block.content,
        style: {
          ...block.content?.style,
          backgroundColor: generatedDesign.primary,
          borderColor: generatedDesign.secondary
        }
      }
    }));

    onApplyDesign({ blocks: updatedBlocks, theme: generatedDesign });
    setIsGenerating(false);
    toast("🤖 AI design generated!", {
      description: `Created design based on: "${designPrompt}"`
    });
  };

  const filteredSuggestions = selectedCategory === 'all' 
    ? designSuggestions 
    : designSuggestions.filter(s => s.category === selectedCategory);

  return (
    <div className="h-full flex flex-col space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wand2 className="h-5 w-5 text-brand-primary" />
          <h3 className="text-lg font-semibold">AI Design Assistant</h3>
          <Badge variant="secondary" className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800">
            <Sparkles className="h-3 w-3 mr-1" />
            Smart
          </Badge>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        <Button
          variant={activeTab === 'suggestions' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('suggestions')}
          className="flex-1"
        >
          Suggestions
        </Button>
        <Button
          variant={activeTab === 'prompt' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('prompt')}
          className="flex-1"
        >
          AI Prompt
        </Button>
        <Button
          variant={activeTab === 'customize' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('customize')}
          className="flex-1"
        >
          Customize
        </Button>
      </div>

      {/* Tab Content */}
      <div className="flex-1">
        {activeTab === 'suggestions' && (
          <div className="space-y-4">
            {/* Category Filter */}
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="color">Color Themes</SelectItem>
                <SelectItem value="layout">Layout Styles</SelectItem>
                <SelectItem value="typography">Typography</SelectItem>
                <SelectItem value="spacing">Spacing</SelectItem>
              </SelectContent>
            </Select>

            {/* Design Suggestions */}
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {filteredSuggestions.map((suggestion) => (
                  <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-medium">{suggestion.name}</h4>
                            {suggestion.premium && (
                              <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800">
                                <Crown className="h-3 w-3 mr-1" />
                                Premium
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                          
                          {/* Preview */}
                          {suggestion.category === 'color' && (
                            <div className="flex gap-2">
                              <div 
                                className="w-6 h-6 rounded border" 
                                style={{ backgroundColor: suggestion.preview.primary }}
                              />
                              <div 
                                className="w-6 h-6 rounded border" 
                                style={{ backgroundColor: suggestion.preview.secondary }}
                              />
                              <div 
                                className="w-6 h-6 rounded border" 
                                style={{ backgroundColor: suggestion.preview.accent }}
                              />
                            </div>
                          )}
                        </div>
                        
                        <Button
                          size="sm"
                          onClick={() => handleApplySuggestion(suggestion)}
                          className="ml-4"
                        >
                          Apply
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="space-y-4">
            <div>
              <Label className="text-sm font-medium mb-2 block">Describe your design vision</Label>
              <Textarea
                placeholder="e.g., 'Create a modern, professional design with blue accents and clean typography for a tech company quote'"
                value={designPrompt}
                onChange={(e) => setDesignPrompt(e.target.value)}
                className="min-h-[100px]"
              />
            </div>

            <Button 
              onClick={handleGenerateFromPrompt} 
              disabled={!designPrompt.trim() || isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <Zap className="h-4 w-4 mr-2 animate-spin" />
                  Generating Design...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Design
                </>
              )}
            </Button>

            {/* AI Tips */}
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium mb-1">AI Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Be specific about colors, mood, and industry</li>
                      <li>• Mention target audience (corporate, creative, etc.)</li>
                      <li>• Include style preferences (modern, classic, minimalist)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'customize' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset Design
                  </Button>
                  <Button variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Style
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Save Theme
                  </Button>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Advanced
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Custom Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Custom Styling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs">Primary Color</Label>
                  <Input type="color" className="h-8 w-full" />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Typography Scale</Label>
                  <Slider defaultValue={[16]} max={24} min={12} step={1} />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs">Spacing</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tight">Tight</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="loose">Loose</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label className="text-xs">Dark Mode</Label>
                  <Switch />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};