import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { 
  Globe, 
  Check, 
  Copy, 
  ExternalLink, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface DomainSetupWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string;
  currentDomain?: string;
}

export const DomainSetupWizard = ({ 
  open, 
  onOpenChange, 
  storeId,
  currentDomain 
}: DomainSetupWizardProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'domain' | 'dns' | 'verify' | 'complete'>('domain');
  const [domain, setDomain] = useState(currentDomain || '');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'idle' | 'checking' | 'success' | 'failed'>('idle');
  const [dnsRecords, setDnsRecords] = useState<any[]>([]);
  const [registrar, setRegistrar] = useState<'godaddy' | 'other'>('other');
  const [isSettingUpGodaddy, setIsSettingUpGodaddy] = useState(false);

  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain);
      generateDNSRecords(currentDomain);
    }
  }, [currentDomain]);

  const generateDNSRecords = (inputDomain: string) => {
    const cleanDomain = inputDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    
    const records = [
      {
        type: 'A',
        name: '@',
        value: '185.158.133.1',
        description: 'Points your root domain to Lovable',
        priority: null,
      },
      {
        type: 'A',
        name: 'www',
        value: '185.158.133.1',
        description: 'Points www subdomain to Lovable',
        priority: null,
      },
      {
        type: 'TXT',
        name: '_lovable',
        value: `lovable_verify=${storeId.substring(0, 16)}`,
        description: 'Verification record to prove domain ownership',
        priority: null,
      },
    ];

    setDnsRecords(records);
  };

  const validateDomain = (inputDomain: string): boolean => {
    const domainRegex = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const cleanDomain = inputDomain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return domainRegex.test(cleanDomain);
  };

  const detectRegistrar = (inputDomain: string) => {
    // Check WHOIS or common patterns (simplified detection)
    const cleanDomain = inputDomain.toLowerCase();
    // In production, you'd want to check WHOIS data
    // For now, we'll let users select their registrar
    return 'other';
  };

  const handleDomainSubmit = () => {
    if (!domain.trim()) {
      toast({
        title: "Domain required",
        description: "Please enter your domain name",
        variant: "destructive",
      });
      return;
    }

    if (!validateDomain(domain)) {
      toast({
        title: "Invalid domain",
        description: "Please enter a valid domain name (e.g., yourstore.com)",
        variant: "destructive",
      });
      return;
    }

    generateDNSRecords(domain);
    setStep('dns');
  };

  const getGoDaddyDNSLink = () => {
    const cleanDomain = domain.replace(/^https?:\/\//, '').replace(/^www\./, '');
    return `https://dcc.godaddy.com/control/portfolio/dns?domain=${cleanDomain}`;
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${type} copied to clipboard`,
    });
  };

  const checkDNSVerification = async () => {
    setIsVerifying(true);
    setVerificationStatus('checking');

    try {
      const { data, error } = await supabase.functions.invoke('verify-domain', {
        body: { domain, storeId }
      });

      if (error) throw error;

      if (data.verified) {
        // Update store with verified domain
        const { error: updateError } = await supabase
          .from('online_stores')
          .update({
            custom_domain: domain,
            domain_verified: true,
          })
          .eq('id', storeId);

        if (updateError) throw updateError;

        setVerificationStatus('success');
        setStep('complete');
        
        toast({
          title: "Domain verified! 🎉",
          description: "Your custom domain is now connected and SSL is being provisioned.",
        });
      } else {
        setVerificationStatus('failed');
        toast({
          title: "Verification pending",
          description: data.message || "DNS records not detected yet. This can take up to 48 hours.",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setVerificationStatus('failed');
      toast({
        title: "Verification failed",
        description: error.message || "Unable to verify domain. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const startAutoVerification = () => {
    setStep('verify');
    setVerificationStatus('checking');
    
    // Auto-check every 10 seconds
    const interval = setInterval(async () => {
      if (verificationStatus !== 'success') {
        await checkDNSVerification();
      } else {
        clearInterval(interval);
      }
    }, 10000);

    // Initial check
    checkDNSVerification();

    // Cleanup
    return () => clearInterval(interval);
  };

  const handleGoDaddyAutoSetup = async () => {
    setIsSettingUpGodaddy(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('godaddy-setup-dns', {
        body: { domain, storeId }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: "DNS records added! 🎉",
          description: data.message,
        });
        
        // Move to verification step after a short delay
        setTimeout(() => {
          startAutoVerification();
        }, 2000);
      } else {
        toast({
          title: "Partial setup",
          description: data.message + " You may need to add some records manually.",
          variant: "destructive",
        });
        console.log('Setup results:', data.results);
      }
    } catch (error: any) {
      console.error('GoDaddy setup error:', error);
      toast({
        title: "Setup failed",
        description: error.message || "Unable to automatically configure DNS. Please add records manually.",
        variant: "destructive",
      });
    } finally {
      setIsSettingUpGodaddy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Globe className="h-6 w-6 text-primary" />
            Connect Custom Domain
          </DialogTitle>
          <DialogDescription>
            Follow these steps to connect your domain in minutes
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between py-4 border-y">
          {[
            { key: 'domain', label: 'Enter Domain', num: 1 },
            { key: 'dns', label: 'Add DNS Records', num: 2 },
            { key: 'verify', label: 'Verify', num: 3 },
            { key: 'complete', label: 'Complete', num: 4 },
          ].map((s, idx) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`flex items-center gap-2 ${
                step === s.key ? 'text-primary' : 
                ['domain', 'dns', 'verify'].indexOf(s.key) < ['domain', 'dns', 'verify'].indexOf(step) ? 'text-green-600' : 
                'text-muted-foreground'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                  step === s.key ? 'border-primary bg-primary/10' :
                  ['domain', 'dns', 'verify'].indexOf(s.key) < ['domain', 'dns', 'verify'].indexOf(step) ? 'border-green-600 bg-green-600 text-white' :
                  'border-muted'
                }`}>
                  {['domain', 'dns', 'verify'].indexOf(s.key) < ['domain', 'dns', 'verify'].indexOf(step) ? 
                    <Check className="h-4 w-4" /> : s.num
                  }
                </div>
                <span className="font-medium hidden md:inline">{s.label}</span>
              </div>
              {idx < 3 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>

        {/* Step 1: Enter Domain */}
        {step === 'domain' && (
          <div className="space-y-6 py-4">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Before you start</AlertTitle>
              <AlertDescription>
                You'll need access to your domain's DNS settings (usually through your domain registrar like GoDaddy, Namecheap, or Cloudflare).
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="domain">Your Domain Name</Label>
                <Input
                  id="domain"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="yourstore.com or www.yourstore.com"
                  autoFocus
                />
                <p className="text-sm text-muted-foreground">
                  Enter the domain you want to use for your store
                </p>
              </div>

              <div className="space-y-2">
                <Label>Where did you buy your domain?</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant={registrar === 'godaddy' ? 'default' : 'outline'}
                    onClick={() => setRegistrar('godaddy')}
                    className="h-auto py-3"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Globe className="h-5 w-5" />
                      <span className="font-semibold">GoDaddy</span>
                    </div>
                  </Button>
                  <Button
                    type="button"
                    variant={registrar === 'other' ? 'default' : 'outline'}
                    onClick={() => setRegistrar('other')}
                    className="h-auto py-3"
                  >
                    <div className="flex flex-col items-center gap-1">
                      <Globe className="h-5 w-5" />
                      <span className="font-semibold">Other Provider</span>
                    </div>
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-2">
              <p className="font-semibold text-blue-900 dark:text-blue-100 text-sm">
                💡 Domain Tips:
              </p>
              <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1 ml-6 list-disc">
                <li>You can use your root domain (example.com) or a subdomain (shop.example.com)</li>
                <li>We'll automatically set up SSL (https) for you</li>
                <li>Both www and non-www versions will work</li>
              </ul>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleDomainSubmit}>
                Continue <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: DNS Records */}
        {step === 'dns' && (
          <div className="space-y-6 py-4">
            {registrar === 'godaddy' ? (
              <Alert className="bg-green-50 dark:bg-green-950 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900 dark:text-green-100">GoDaddy Automatic Setup ✨</AlertTitle>
                <AlertDescription className="text-green-800 dark:text-green-200">
                  Great news! We can automatically configure your GoDaddy DNS for you. Just click the button below - no copy/paste needed!
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Globe className="h-4 w-4" />
                <AlertTitle>Add these DNS records</AlertTitle>
                <AlertDescription>
                  Go to your domain registrar and add the following DNS records. Changes can take up to 48 hours to propagate.
                </AlertDescription>
              </Alert>
            )}

            {registrar === 'godaddy' && (
              <div className="space-y-3">
                <Button
                  onClick={handleGoDaddyAutoSetup}
                  disabled={isSettingUpGodaddy}
                  className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                  size="lg"
                >
                  {isSettingUpGodaddy ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Setting up DNS automatically...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      Set Up Automatically (Recommended)
                    </>
                  )}
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or set up manually
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => window.open(getGoDaddyDNSLink(), '_blank')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  <ExternalLink className="mr-2 h-5 w-5" />
                  Open GoDaddy DNS Settings Manually
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {dnsRecords.map((record, idx) => (
                <Card key={idx} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge>{record.type}</Badge>
                          <span className="font-semibold">{record.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {record.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Type</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="px-2 py-1 bg-muted rounded">{record.type}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(record.type, 'Type')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>

                      <div>
                        <Label className="text-xs text-muted-foreground">Name/Host</Label>
                        <div className="flex items-center gap-2 mt-1">
                          <code className="px-2 py-1 bg-muted rounded">{record.name}</code>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(record.name, 'Name')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs text-muted-foreground">Value/Points To</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="px-2 py-1 bg-muted rounded flex-1 break-all text-xs">
                          {record.value}
                        </code>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => copyToClipboard(record.value, 'Value')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {registrar === 'godaddy' ? (
              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-semibold text-blue-900 dark:text-blue-100">
                      GoDaddy Step-by-Step:
                    </p>
                    <ol className="text-blue-800 dark:text-blue-200 space-y-2 ml-4 list-decimal">
                      <li>Click "Open GoDaddy DNS Settings" above (opens in new tab)</li>
                      <li>Scroll down to the "DNS Records" section</li>
                      <li>For each record below, click "Add New Record"</li>
                      <li>Copy the values using the copy buttons</li>
                      <li>Click "Save" in GoDaddy after adding all records</li>
                    </ol>
                    <p className="mt-3 text-blue-700 dark:text-blue-300 font-medium">
                      💡 Tip: Leave TTL at default (usually 1 hour or 600 seconds)
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                      Important Notes:
                    </p>
                    <ul className="text-yellow-800 dark:text-yellow-200 space-y-1 ml-4 list-disc">
                      <li>Add ALL three DNS records for your domain to work properly</li>
                      <li>DNS changes can take 5 minutes to 48 hours to propagate</li>
                      <li>Some registrars use different field names (Host, Name, etc.)</li>
                      <li>Remove any existing A or CNAME records that point to other services</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => window.open('https://docs.lovable.dev/features/custom-domain', '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View Detailed DNS Setup Guide
              </Button>
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('domain')}>
                Back
              </Button>
              <Button onClick={startAutoVerification}>
                I've Added The Records <Check className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Verification */}
        {step === 'verify' && (
          <div className="space-y-6 py-4">
            <div className="text-center py-8">
              {verificationStatus === 'checking' && (
                <>
                  <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Checking DNS Records...</h3>
                  <p className="text-muted-foreground mb-4">
                    We're verifying that your DNS records are configured correctly
                  </p>
                  <Progress value={undefined} className="w-64 mx-auto" />
                </>
              )}

              {verificationStatus === 'failed' && (
                <>
                  <XCircle className="h-16 w-16 text-red-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">DNS Records Not Detected Yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Don't worry - DNS changes can take time to propagate (up to 48 hours)
                  </p>
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-left">
                      <strong>Common issues:</strong>
                      <ul className="mt-2 space-y-1 ml-4 list-disc text-sm">
                        <li>DNS changes haven't propagated yet (wait 5-60 minutes)</li>
                        <li>Records were not added correctly - double check spelling</li>
                        <li>Conflicting existing DNS records need to be removed</li>
                        <li>Some registrars require removing the domain from the "Name" field when using @</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </>
              )}
            </div>

            <div className="flex justify-between gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('dns')}>
                Back to DNS Records
              </Button>
              <Button
                onClick={checkDNSVerification}
                disabled={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    Check Again
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && (
          <div className="space-y-6 py-8">
            <div className="text-center">
              <CheckCircle2 className="h-20 w-20 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold mb-2">Domain Connected! 🎉</h3>
              <p className="text-lg text-muted-foreground mb-6">
                Your store is now available at:
              </p>
              <div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg inline-block">
                <code className="text-lg font-semibold text-green-900 dark:text-green-100">
                  https://{domain}
                </code>
              </div>
            </div>

            <Alert>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle>What happens next?</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 ml-4 list-disc text-sm">
                  <li>SSL certificate is being provisioned (automatic, takes 5-15 minutes)</li>
                  <li>Both www and non-www versions will work</li>
                  <li>Your store is already live and accessible!</li>
                  <li>You can update or remove this domain anytime in settings</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3 pt-4">
              <Button
                size="lg"
                onClick={() => window.open(`https://${domain}`, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                Visit Your Store
              </Button>
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
