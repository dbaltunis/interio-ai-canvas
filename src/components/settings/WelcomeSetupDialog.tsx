import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useSampleData } from "@/hooks/useSampleData";
import { useOnboarding } from "@/components/onboarding/OnboardingProvider";
import { motion } from "framer-motion";

interface WelcomeSetupDialogProps {
  isOpen: boolean;
  onComplete: () => void;
}

export const WelcomeSetupDialog = ({ isOpen, onComplete }: WelcomeSetupDialogProps) => {
  const [selectedOptions, setSelectedOptions] = useState({
    sampleData: true,
    tour: true,
  });
  const { seedSampleData, isSeedingData } = useSampleData();
  const { startTour } = useOnboarding();

  if (!isOpen) return null;

  const handleSetup = async () => {
    if (selectedOptions.sampleData) {
      await seedSampleData();
    }

    if (selectedOptions.tour) {
      startTour();
    }

    onComplete();
  };

  const toggleOption = (option: keyof typeof selectedOptions) => {
    setSelectedOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-lg"
      >
        <Card className="shadow-2xl border-2 border-primary/20">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="h-12 w-12 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome to Your Platform! 🎉</CardTitle>
            <p className="text-muted-foreground mt-2">
              Let's get you set up in just a few seconds
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Options */}
            <div className="space-y-4">
              <div
                className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => toggleOption("sampleData")}
              >
                <Checkbox
                  checked={selectedOptions.sampleData}
                  onCheckedChange={() => toggleOption("sampleData")}
                />
                <div className="flex-1">
                  <h4 className="font-medium">Add Sample Data</h4>
                  <p className="text-sm text-muted-foreground">
                    We'll create example clients and projects to help you explore features
                  </p>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${selectedOptions.sampleData ? "text-primary" : "text-muted-foreground/30"}`} />
              </div>

              <div
                className="flex items-start space-x-3 p-4 border rounded-lg hover:border-primary/50 cursor-pointer transition-colors"
                onClick={() => toggleOption("tour")}
              >
                <Checkbox
                  checked={selectedOptions.tour}
                  onCheckedChange={() => toggleOption("tour")}
                />
                <div className="flex-1">
                  <h4 className="font-medium">Take a Quick Tour</h4>
                  <p className="text-sm text-muted-foreground">
                    2-minute guided tour of the key features (highly recommended)
                  </p>
                </div>
                <CheckCircle2 className={`h-5 w-5 ${selectedOptions.tour ? "text-primary" : "text-muted-foreground/30"}`} />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={onComplete}
                className="flex-1"
                disabled={isSeedingData}
              >
                Skip Setup
              </Button>
              <Button
                onClick={handleSetup}
                className="flex-1 bg-primary hover:bg-primary/90"
                disabled={isSeedingData}
              >
                {isSeedingData ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Started
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};
