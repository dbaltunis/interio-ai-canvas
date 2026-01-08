import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface MissingGridWarningProps {
  priceGroup?: string | null;
  productType?: string;
  materialName?: string;
}

export const MissingGridWarning = ({ 
  priceGroup, 
  productType,
  materialName 
}: MissingGridWarningProps) => {
  const navigate = useNavigate();

  if (!priceGroup) return null;

  return (
    <Alert variant="destructive" className="mt-2 py-2">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-xs">
          No pricing grid found for <strong>Group {priceGroup}</strong>
          {productType && ` (${productType.replace(/_/g, ' ')})`}. 
          Price cannot be calculated.
        </span>
        <Button 
          size="sm" 
          variant="outline" 
          className="h-6 text-xs ml-2"
          onClick={() => navigate('/settings?tab=pricing')}
        >
          Upload Grid
        </Button>
      </AlertDescription>
    </Alert>
  );
};
