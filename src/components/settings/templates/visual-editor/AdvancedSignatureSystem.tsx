import React, { useState, useRef, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Pen,
  Check,
  X,
  Calendar,
  Clock,
  User,
  Shield,
  FileText,
  Download,
  Share2,
  Mail,
  Eye,
  UserCheck
} from "lucide-react";
import { SignatureCanvas } from './SignatureCanvas';
import { toast } from "sonner";

interface AdvancedSignatureSystemProps {
  content: any;
  onUpdate: (content: any) => void;
  isEditable?: boolean;
  readonly?: boolean;
}

interface SignatureField {
  id: string;
  label: string;
  role: 'client' | 'contractor' | 'witness' | 'manager';
  required: boolean;
  signed: boolean;
  signatureData?: string;
  signedAt?: string;
  signerName?: string;
  signerEmail?: string;
  ipAddress?: string;
  deviceInfo?: string;
}

export const AdvancedSignatureSystem = ({
  content,
  onUpdate,
  isEditable = false,
  readonly = false
}: AdvancedSignatureSystemProps) => {
  const [activeSignature, setActiveSignature] = useState<string | null>(null);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [auditMode, setAuditMode] = useState(false);
  const [workflowStatus, setWorkflowStatus] = useState(content.workflowStatus || 'draft');

  const defaultSignatures: SignatureField[] = [
    {
      id: 'client',
      label: 'Client Approval',
      role: 'client',
      required: true,
      signed: false
    },
    {
      id: 'contractor',
      label: 'Contractor Agreement',
      role: 'contractor',
      required: true,
      signed: false
    },
    {
      id: 'witness',
      label: 'Witness Signature',
      role: 'witness',
      required: false,
      signed: false
    }
  ];

  const [signatures, setSignatures] = useState<SignatureField[]>(
    content.signatures || defaultSignatures
  );

  const updateContent = (updates: any) => {
    onUpdate({ ...content, ...updates });
  };

  const handleSignatureComplete = (signatureData: string) => {
    if (!activeSignature) return;

    const updatedSignatures = signatures.map(sig => 
      sig.id === activeSignature 
        ? {
            ...sig,
            signed: true,
            signatureData,
            signedAt: new Date().toISOString(),
            signerName: content.signerName || 'Digital Signer',
            signerEmail: content.signerEmail || 'signer@example.com',
            ipAddress: '192.168.1.1', // In real app, get actual IP
            deviceInfo: navigator.userAgent
          }
        : sig
    );

    setSignatures(updatedSignatures);
    updateContent({ signatures: updatedSignatures });
    setShowSignatureModal(false);
    setActiveSignature(null);
    
    // Check if all required signatures are complete
    const allRequiredSigned = updatedSignatures
      .filter(sig => sig.required)
      .every(sig => sig.signed);
    
    if (allRequiredSigned && workflowStatus === 'pending-signatures') {
      setWorkflowStatus('completed');
      updateContent({ workflowStatus: 'completed' });
      toast("All required signatures completed! Document is now finalized.");
    } else {
      toast("Signature captured successfully!");
    }
  };

  const clearSignature = (signatureId: string) => {
    const updatedSignatures = signatures.map(sig =>
      sig.id === signatureId
        ? {
            ...sig,
            signed: false,
            signatureData: undefined,
            signedAt: undefined,
            signerName: undefined,
            signerEmail: undefined,
            ipAddress: undefined,
            deviceInfo: undefined
          }
        : sig
    );
    
    setSignatures(updatedSignatures);
    updateContent({ signatures: updatedSignatures });
    toast("Signature cleared");
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-gray-100 text-gray-800', label: 'Draft' },
      'pending-signatures': { color: 'bg-yellow-100 text-yellow-800', label: 'Pending Signatures' },
      'partially-signed': { color: 'bg-blue-100 text-blue-800', label: 'Partially Signed' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getCompletionPercentage = () => {
    const totalRequired = signatures.filter(sig => sig.required).length;
    const signedRequired = signatures.filter(sig => sig.required && sig.signed).length;
    return totalRequired > 0 ? (signedRequired / totalRequired) * 100 : 0;
  };

  const renderSignatureField = (signature: SignatureField) => (
    <Card key={signature.id} className="p-6 hover-scale transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={`/avatars/${signature.role}.png`} />
            <AvatarFallback>
              {signature.role === 'client' ? <User className="h-5 w-5" /> : 
               signature.role === 'contractor' ? <Shield className="h-5 w-5" /> :
               signature.role === 'witness' ? <Eye className="h-5 w-5" /> :
               <UserCheck className="h-5 w-5" />}
            </AvatarFallback>
          </Avatar>
          <div>
            <h4 className="font-medium">{signature.label}</h4>
            <p className="text-sm text-gray-600 capitalize">{signature.role}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {signature.required && (
            <Badge variant="outline" className="text-xs">Required</Badge>
          )}
          {signature.signed ? (
            <Badge className="bg-green-100 text-green-800">
              <Check className="h-3 w-3 mr-1" />
              Signed
            </Badge>
          ) : (
            <Badge variant="outline">Pending</Badge>
          )}
        </div>
      </div>

      {signature.signed ? (
        <div className="space-y-4">
          {/* Signature Display */}
          <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-green-800">Digital Signature</span>
              <Check className="h-4 w-4 text-green-600" />
            </div>
            {signature.signatureData && (
              <img 
                src={signature.signatureData} 
                alt="Signature" 
                className="h-16 object-contain bg-white border rounded"
              />
            )}
          </div>

          {/* Signature Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <span>{signature.signerName}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-400" />
              <span>{signature.signerEmail}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span>{signature.signedAt ? new Date(signature.signedAt).toLocaleDateString() : 'N/A'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span>{signature.signedAt ? new Date(signature.signedAt).toLocaleTimeString() : 'N/A'}</span>
            </div>
          </div>

          {/* Actions */}
          {!readonly && (
            <div className="flex gap-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={() => clearSignature(signature.id)}
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
              {auditMode && (
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-1" />
                  Audit Trail
                </Button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Signature Placeholder */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
            onClick={() => !readonly && (setActiveSignature(signature.id), setShowSignatureModal(true))}
          >
            <Pen className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 font-medium">Click to sign</p>
            <p className="text-sm text-gray-500 mt-1">
              {signature.required ? 'Signature required' : 'Optional signature'}
            </p>
          </div>
        </div>
      )}
    </Card>
  );

  const renderWorkflowHeader = () => (
    <Card className="p-6 mb-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold">Document Approval Workflow</h3>
          <p className="text-gray-600">
            {content.documentTitle || 'Quote & Service Agreement'}
          </p>
        </div>
        {getStatusBadge(workflowStatus)}
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Completion Progress</span>
          <span>{Math.round(getCompletionPercentage())}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getCompletionPercentage()}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {signatures.filter(s => s.signed).length}
          </div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {signatures.filter(s => !s.signed && s.required).length}
          </div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {signatures.filter(s => s.required).length}
          </div>
          <div className="text-sm text-gray-600">Required</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-600">
            {signatures.length}
          </div>
          <div className="text-sm text-gray-600">Total</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t">
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button variant="outline" size="sm">
          <Share2 className="h-4 w-4 mr-2" />
          Share Document
        </Button>
        <Button variant="outline" size="sm">
          <Mail className="h-4 w-4 mr-2" />
          Send Reminders
        </Button>
        <div className="ml-auto flex items-center space-x-2">
          <Switch
            checked={auditMode}
            onCheckedChange={setAuditMode}
          />
          <Label className="text-sm">Audit Mode</Label>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {renderWorkflowHeader()}
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {signatures.map(renderSignatureField)}
      </div>

      {/* Signature Modal */}
      {showSignatureModal && activeSignature && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold">
                  {signatures.find(s => s.id === activeSignature)?.label}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSignatureModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <SignatureCanvas
                onSignatureSave={handleSignatureComplete}
                width={500}
                height={200}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};