import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { QRCodeSVG } from 'qrcode.react';
import { 
  QrCode,
  Calculator,
  Percent,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Calendar,
  MapPin,
  Clock,
  Gauge,
  BarChart3,
  Video,
  ExternalLink,
  Phone,
  Mail,
  MessageCircle
} from "lucide-react";
import { formatCurrency } from '@/utils/templateRenderer';

interface DynamicContentBlockProps {
  type: 'qr-code' | 'auto-calculation' | 'conditional-content' | 'progress-tracker' | 'interactive-cta';
  content: any;
  onUpdate: (content: any) => void;
  projectData?: any;
  isEditable?: boolean;
}

export const DynamicContentBlock = ({
  type,
  content,
  onUpdate,
  projectData,
  isEditable = false
}: DynamicContentBlockProps) => {
  const updateContent = (updates: any) => {
    onUpdate({ ...content, ...updates });
  };

  switch (type) {
    case 'qr-code':
      return <QRCodeBlock content={content} onUpdate={updateContent} isEditable={isEditable} />;
    case 'auto-calculation':
      return <AutoCalculationBlock content={content} onUpdate={updateContent} projectData={projectData} isEditable={isEditable} />;
    case 'conditional-content':
      return <ConditionalContentBlock content={content} onUpdate={updateContent} projectData={projectData} isEditable={isEditable} />;
    case 'progress-tracker':
      return <ProgressTrackerBlock content={content} onUpdate={updateContent} projectData={projectData} isEditable={isEditable} />;
    case 'interactive-cta':
      return <InteractiveCTABlock content={content} onUpdate={updateContent} isEditable={isEditable} />;
    default:
      return null;
  }
};

// QR Code Block Component
const QRCodeBlock = ({ content, onUpdate, isEditable }: any) => {
  const [qrContent, setQrContent] = useState(content.qrContent || '');
  const [size, setSize] = useState(content.size || 128);
  const [includeText, setIncludeText] = useState(content.includeText !== false);

  const qrTypes = [
    { value: 'url', label: 'Website URL', icon: ExternalLink },
    { value: 'email', label: 'Email Address', icon: Mail },
    { value: 'phone', label: 'Phone Number', icon: Phone },
    { value: 'sms', label: 'SMS Message', icon: MessageCircle },
    { value: 'payment', label: 'Payment Link', icon: DollarSign },
    { value: 'vcard', label: 'Contact Card', icon: MapPin }
  ];

  const generateQRContent = (type: string, data: string) => {
    switch (type) {
      case 'email':
        return `mailto:${data}`;
      case 'phone':
        return `tel:${data}`;
      case 'sms':
        return `sms:${data}`;
      case 'payment':
        return data; // Payment URLs are used as-is
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${data}\nEND:VCARD`;
      default:
        return data;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <QrCode className="h-5 w-5" />
        <h3 className="font-semibold">QR Code</h3>
      </div>

      {isEditable && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label>QR Code Content</Label>
            <Input
              placeholder="Enter URL, text, or other content..."
              value={qrContent}
              onChange={(e) => {
                setQrContent(e.target.value);
                onUpdate({ ...content, qrContent: e.target.value });
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Size</Label>
              <Input
                type="number"
                value={size}
                onChange={(e) => {
                  const newSize = parseInt(e.target.value);
                  setSize(newSize);
                  onUpdate({ ...content, size: newSize });
                }}
                min="64"
                max="512"
              />
            </div>
            
            <div className="flex items-center space-x-2 pt-7">
              <Switch
                checked={includeText}
                onCheckedChange={(checked) => {
                  setIncludeText(checked);
                  onUpdate({ ...content, includeText: checked });
                }}
              />
              <Label>Show text label</Label>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-center">
        <div className="text-center">
          {qrContent ? (
            <QRCodeSVG
              value={qrContent}
              size={size}
              className="mx-auto border rounded"
            />
          ) : (
            <div 
              className="border-2 border-dashed border-gray-300 rounded flex items-center justify-center"
              style={{ width: size, height: size }}
            >
              <QrCode className="h-8 w-8 text-gray-400" />
            </div>
          )}
          
          {includeText && qrContent && (
            <p className="text-sm text-gray-600 mt-2 max-w-[200px] truncate">
              {qrContent}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

// Auto Calculation Block Component
const AutoCalculationBlock = ({ content, onUpdate, projectData, isEditable }: any) => {
  const [showBreakdown, setShowBreakdown] = useState(content.showBreakdown !== false);
  const [calculationType, setCalculationType] = useState(content.calculationType || 'quote-total');

  // Calculate values from project data
  const calculations = {
    'quote-total': {
      label: 'Quote Total',
      value: projectData?.total || 0,
      icon: DollarSign,
      color: 'text-green-600',
      isPercentage: false
    },
    'markup-amount': {
      label: 'Markup Amount',
      value: (projectData?.total || 0) - (projectData?.subtotal || 0),
      icon: TrendingUp,
      color: 'text-blue-600',
      isPercentage: false
    },
    'tax-calculation': {
      label: 'Tax Amount',
      value: projectData?.taxAmount || 0,
      icon: Percent,
      color: 'text-yellow-600',
      isPercentage: false
    },
    'profit-margin': {
      label: 'Profit Margin',
      value: projectData?.markupPercentage || 0,
      icon: BarChart3,
      color: 'text-purple-600',
      isPercentage: true
    }
  };

  const currentCalc = calculations[calculationType as keyof typeof calculations];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="h-5 w-5" />
        <h3 className="font-semibold">Auto Calculation</h3>
      </div>

      {isEditable && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <Label>Calculation Type</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(calculations).map(([key, calc]) => {
              const Icon = calc.icon;
              return (
                <Button
                  key={key}
                  variant={calculationType === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setCalculationType(key);
                    onUpdate({ ...content, calculationType: key });
                  }}
                  className="justify-start"
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {calc.label}
                </Button>
              );
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              checked={showBreakdown}
              onCheckedChange={(checked) => {
                setShowBreakdown(checked);
                onUpdate({ ...content, showBreakdown: checked });
              }}
            />
            <Label>Show calculation breakdown</Label>
          </div>
        </div>
      )}

      <div className="text-center">
        <div className={`text-4xl font-bold mb-2 ${currentCalc.color}`}>
          {currentCalc.isPercentage 
            ? `${currentCalc.value}%`
            : formatCurrency(currentCalc.value)
          }
        </div>
        <div className="text-lg text-gray-600 mb-4">{currentCalc.label}</div>

        {showBreakdown && projectData && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-700">
                {formatCurrency(projectData.subtotal || 0)}
              </div>
              <div className="text-sm text-gray-500">Subtotal</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {formatCurrency(projectData.taxAmount || 0)}
              </div>
              <div className="text-sm text-gray-500">Tax</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {formatCurrency(projectData.total || 0)}
              </div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

// Conditional Content Block Component
const ConditionalContentBlock = ({ content, onUpdate, projectData, isEditable }: any) => {
  const [condition, setCondition] = useState(content.condition || 'total-above');
  const [threshold, setThreshold] = useState(content.threshold || 1000);
  const [showContent, setShowContent] = useState(content.showContent || 'Eligible for premium service!');

  // Evaluate condition
  const evaluateCondition = () => {
    if (!projectData) return false;
    
    switch (condition) {
      case 'total-above':
        return (projectData.total || 0) > threshold;
      case 'total-below':
        return (projectData.total || 0) < threshold;
      case 'has-premium-items':
        return projectData.treatments?.some((t: any) => t.category === 'premium');
      case 'multiple-rooms':
        return (projectData.rooms?.length || 0) > 1;
      default:
        return false;
    }
  };

  const shouldShow = evaluateCondition();

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <ArrowRight className="h-5 w-5" />
        <h3 className="font-semibold">Conditional Content</h3>
      </div>

      {isEditable && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="space-y-2">
            <Label>Condition</Label>
            <select
              className="w-full p-2 border rounded"
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                onUpdate({ ...content, condition: e.target.value });
              }}
            >
              <option value="total-above">Total above amount</option>
              <option value="total-below">Total below amount</option>
              <option value="has-premium-items">Has premium items</option>
              <option value="multiple-rooms">Multiple rooms</option>
            </select>
          </div>
          
          {(condition === 'total-above' || condition === 'total-below') && (
            <div className="space-y-2">
              <Label>Threshold Amount</Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => {
                  const value = parseFloat(e.target.value);
                  setThreshold(value);
                  onUpdate({ ...content, threshold: value });
                }}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Content to Show</Label>
            <Input
              value={showContent}
              onChange={(e) => {
                setShowContent(e.target.value);
                onUpdate({ ...content, showContent: e.target.value });
              }}
              placeholder="Enter content to display when condition is met..."
            />
          </div>
        </div>
      )}

      {shouldShow ? (
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg animate-fade-in">
          <div className="text-green-800 font-medium">{showContent}</div>
        </div>
      ) : (
        <div className="text-center p-4 text-gray-500 italic">
          Condition not met - content hidden
        </div>
      )}
    </Card>
  );
};

// Progress Tracker Block Component
const ProgressTrackerBlock = ({ content, onUpdate, projectData, isEditable }: any) => {
  const defaultSteps = [
    { id: 'consultation', label: 'Initial Consultation', completed: true },
    { id: 'measurement', label: 'Measurements', completed: true },
    { id: 'quote', label: 'Quote Prepared', completed: true },
    { id: 'approval', label: 'Client Approval', completed: false },
    { id: 'production', label: 'Production', completed: false },
    { id: 'installation', label: 'Installation', completed: false }
  ];

  const [steps, setSteps] = useState(content.steps || defaultSteps);

  const completedSteps = steps.filter((step: any) => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gauge className="h-5 w-5" />
        <h3 className="font-semibold">Project Progress</h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Progress</span>
          <span>{Math.round(progressPercentage)}% Complete</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className="bg-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {steps.map((step: any, index: number) => (
          <div key={step.id} className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
              step.completed 
                ? 'bg-green-600 text-white' 
                : index === completedSteps 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span className="text-xs font-bold">{index + 1}</span>
              )}
            </div>
            <span className={`font-medium ${
              step.completed ? 'text-green-600' : 'text-gray-600'
            }`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </Card>
  );
};

// Interactive CTA Block Component
const InteractiveCTABlock = ({ content, onUpdate, isEditable }: any) => {
  const [ctaType, setCTAType] = useState(content.ctaType || 'schedule-call');
  const [buttonText, setButtonText] = useState(content.buttonText || 'Schedule Consultation');
  const [actionUrl, setActionUrl] = useState(content.actionUrl || '');

  const ctaTypes = {
    'schedule-call': { label: 'Schedule Call', icon: Phone, color: 'bg-blue-600 hover:bg-blue-700' },
    'book-meeting': { label: 'Book Meeting', icon: Calendar, color: 'bg-green-600 hover:bg-green-700' },
    'watch-video': { label: 'Watch Video', icon: Video, color: 'bg-purple-600 hover:bg-purple-700' },
    'get-quote': { label: 'Get Quote', icon: DollarSign, color: 'bg-orange-600 hover:bg-orange-700' },
    'contact-us': { label: 'Contact Us', icon: MessageCircle, color: 'bg-gray-600 hover:bg-gray-700' }
  };

  const currentType = ctaTypes[ctaType as keyof typeof ctaTypes];
  const Icon = currentType.icon;

  return (
    <Card className="p-6 text-center">
      <div className="flex items-center gap-2 justify-center mb-4">
        <ArrowRight className="h-5 w-5" />
        <h3 className="font-semibold">Call to Action</h3>
      </div>

      {isEditable && (
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg text-left">
          <div className="space-y-2">
            <Label>CTA Type</Label>
            <select
              className="w-full p-2 border rounded"
              value={ctaType}
              onChange={(e) => {
                setCTAType(e.target.value);
                onUpdate({ ...content, ctaType: e.target.value });
              }}
            >
              {Object.entries(ctaTypes).map(([key, type]) => (
                <option key={key} value={key}>{type.label}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <Label>Button Text</Label>
            <Input
              value={buttonText}
              onChange={(e) => {
                setButtonText(e.target.value);
                onUpdate({ ...content, buttonText: e.target.value });
              }}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Action URL</Label>
            <Input
              value={actionUrl}
              onChange={(e) => {
                setActionUrl(e.target.value);
                onUpdate({ ...content, actionUrl: e.target.value });
              }}
              placeholder="https://calendly.com/your-link"
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <p className="text-gray-600 mb-6">
          Ready to get started? {ctaType === 'schedule-call' ? 'Book a consultation call' : 'Take the next step'} with our team.
        </p>
        
        <Button 
          size="lg" 
          className={`cta-button ${currentType.color} text-white px-8 py-3 text-lg`}
          onClick={() => actionUrl && window.open(actionUrl, '_blank')}
        >
          <Icon className="h-5 w-5 mr-2" />
          {buttonText}
        </Button>
        
        <div className="flex items-center justify-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            Free consultation
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            Virtual or in-person
          </div>
        </div>
      </div>
    </Card>
  );
};