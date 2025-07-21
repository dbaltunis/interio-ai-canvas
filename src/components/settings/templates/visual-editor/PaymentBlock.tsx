
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CreditCard, DollarSign } from "lucide-react";

interface PaymentBlockProps {
  content: any;
  onUpdate: (content: any) => void;
}

export const PaymentBlock = ({ content, onUpdate }: PaymentBlockProps) => {
  return (
    <div className="space-y-4">
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900">
                {content.buttonText || "Pay Now"}
              </h3>
              <p className="text-sm text-blue-700">
                {content.description || "Secure payment processing"}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              {content.currency || "$"}{content.amount || "0.00"}
            </div>
            <div className="text-sm text-blue-700">
              {content.paymentType === 'full' ? 'Full Payment' : 
               content.paymentType === 'deposit' ? `${content.depositPercentage}% Deposit` : 
               'Custom Amount'}
            </div>
          </div>
        </div>
        
        <div className="mt-4 flex gap-3">
          <Button className="bg-blue-600 hover:bg-blue-700 flex-1">
            <CreditCard className="h-4 w-4 mr-2" />
            {content.buttonText || "Pay Now"}
          </Button>
          {content.showInstallments && (
            <Button variant="outline" className="border-blue-300 text-blue-700">
              <DollarSign className="h-4 w-4 mr-2" />
              Payment Plan
            </Button>
          )}
        </div>
        
        <div className="mt-3 text-xs text-blue-600 text-center">
          {content.securityText || "🔒 Secure SSL encrypted payment"}
        </div>
      </Card>

      {/* Configuration Panel */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t">
        <div className="space-y-2">
          <Label>Payment Type</Label>
          <Select
            value={content.paymentType || 'full'}
            onValueChange={(value) => onUpdate({ ...content, paymentType: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Payment</SelectItem>
              <SelectItem value="deposit">Deposit</SelectItem>
              <SelectItem value="custom">Custom Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {content.paymentType === 'deposit' && (
          <div className="space-y-2">
            <Label>Deposit Percentage</Label>
            <Input
              type="number"
              value={content.depositPercentage || 50}
              onChange={(e) => onUpdate({ ...content, depositPercentage: parseInt(e.target.value) })}
              min="1"
              max="100"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Currency</Label>
          <Select
            value={content.currency || '$'}
            onValueChange={(value) => onUpdate({ ...content, currency: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="$">USD ($)</SelectItem>
              <SelectItem value="€">EUR (€)</SelectItem>
              <SelectItem value="£">GBP (£)</SelectItem>
              <SelectItem value="₹">INR (₹)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={content.amount || '0.00'}
            onChange={(e) => onUpdate({ ...content, amount: e.target.value })}
            placeholder="0.00"
            step="0.01"
          />
        </div>

        <div className="space-y-2">
          <Label>Button Text</Label>
          <Input
            value={content.buttonText || 'Pay Now'}
            onChange={(e) => onUpdate({ ...content, buttonText: e.target.value })}
            placeholder="Pay Now"
          />
        </div>

        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            value={content.description || 'Secure payment processing'}
            onChange={(e) => onUpdate({ ...content, description: e.target.value })}
            placeholder="Payment description"
          />
        </div>

        <div className="flex items-center space-x-2 col-span-2">
          <Switch
            checked={content.showInstallments || false}
            onCheckedChange={(checked) => onUpdate({ ...content, showInstallments: checked })}
          />
          <Label>Show Payment Plan Option</Label>
        </div>

        <div className="space-y-2 col-span-2">
          <Label>Security Text</Label>
          <Input
            value={content.securityText || '🔒 Secure SSL encrypted payment'}
            onChange={(e) => onUpdate({ ...content, securityText: e.target.value })}
            placeholder="Security message"
          />
        </div>
      </div>
    </div>
  );
};
