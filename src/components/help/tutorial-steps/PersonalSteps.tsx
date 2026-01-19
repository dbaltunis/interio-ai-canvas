import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Phone, Globe, Bell, Lock, Save, Camera, 
  Eye, EyeOff, Calendar, Clock, Languages, Check 
} from "lucide-react";
import {
  AnimatedFormSection,
  AnimatedMockInput,
  AnimatedMockButton,
  AnimatedMockToggle,
  AnimatedMockSelect,
  AnimatedMockAvatar,
  AnimatedSuccessToast,
  AnimatedPasswordStrength,
  AnimatedPreviewBox,
  AnimatedMockCard,
} from "../demo-components";

interface StepProps {
  phase?: number;
}

// ===========================================
// PERSONAL SETTINGS TUTORIAL - 10 INTERACTIVE STEPS
// Multi-phase animations for engaging experience
// ===========================================

// Step 1: Upload Profile Picture
export const PersonalStep1 = ({ phase = 0 }: StepProps) => {
  const showSection = phase > 0.1;
  const avatarHighlight = phase > 0.25 && phase < 0.6;
  const buttonHighlight = phase > 0.6 && phase < 0.85;
  const showSuccess = phase > 0.85;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Profile Information" icon={User} phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-4">
          <AnimatedMockAvatar 
            phase={phase} 
            highlightPhase={0.25} 
            uploadPhase={0.7} 
          />
          <div className="space-y-2">
            <AnimatedMockButton 
              phase={phase} 
              clickPhase={0.7} 
              highlight={buttonHighlight}
              icon={Camera}
            >
              Upload Photo
            </AnimatedMockButton>
            <motion.p 
              className="text-xs text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: showSection ? 1 : 0 }}
            >
              JPG, PNG up to 2MB
            </motion.p>
          </div>
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Profile photo uploaded!" phase={phase} showPhase={0.85} />
    </div>
  );
};

// Step 2: Enter Profile Details
export const PersonalStep2 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Profile Information" icon={User} phase={phase} revealPhase={0.1}>
        <div className="grid grid-cols-2 gap-3">
          <AnimatedMockInput 
            label="First Name" 
            value="John" 
            icon={User}
            phase={phase}
            startPhase={0.15}
            endPhase={0.35}
          />
          <AnimatedMockInput 
            label="Last Name" 
            value="Smith" 
            phase={phase}
            startPhase={0.35}
            endPhase={0.5}
          />
        </div>
        <div className="mt-3">
          <AnimatedMockInput 
            label="Display Name" 
            value="John Smith" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.7}
          />
          <motion.p 
            className="text-[10px] text-muted-foreground mt-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase > 0.7 ? 1 : 0 }}
          >
            Shown on documents and communications
          </motion.p>
        </div>
        <div className="mt-3">
          <AnimatedMockInput 
            label="Phone Number" 
            value="+61 400 123 456" 
            icon={Phone}
            phase={phase}
            startPhase={0.7}
            endPhase={0.9}
          />
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Profile details saved!" phase={phase} showPhase={0.92} />
    </div>
  );
};

// Step 3: Change Email Address
export const PersonalStep3 = ({ phase = 0 }: StepProps) => {
  const showVerificationNote = phase > 0.6;
  const buttonClicked = phase > 0.7;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Profile Information" icon={User} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedMockInput 
            label="Current Email" 
            value="john@company.com" 
            icon={Mail}
            phase={phase}
            startPhase={0}
            endPhase={0}
            disabled
          />
          <div className="flex items-center gap-2">
            <AnimatedMockButton 
              phase={phase} 
              clickPhase={0.5}
              variant="outline"
              highlight={phase > 0.3 && phase < 0.7}
            >
              Change Email
            </AnimatedMockButton>
          </div>
        </div>
        <AnimatePresence>
          {showVerificationNote && (
            <motion.div 
              initial={{ opacity: 0, y: 10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -10 }}
              className="mt-3 p-2 bg-muted/50 rounded border border-dashed border-muted-foreground/30"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-3 w-3 text-primary" />
                <p className="text-[10px] text-muted-foreground">
                  A verification email will be sent to confirm the new address
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 4: Configure Notifications
export const PersonalStep4 = ({ phase = 0 }: StepProps) => {
  const testButtonHighlight = phase > 0.7 && phase < 0.9;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Notification Preferences" icon={Bell} phase={phase} revealPhase={0.1}>
        <div className="space-y-2">
          <AnimatedMockToggle 
            label="Email notifications" 
            description="Receive updates via email"
            checked={false}
            phase={phase}
            flipPhase={0.3}
          />
          <AnimatedMockToggle 
            label="SMS notifications" 
            description="Get text alerts"
            checked={false}
            phase={phase}
            flipPhase={0.5}
          />
        </div>
        <div className="flex gap-2 mt-3">
          <AnimatedMockButton 
            phase={phase} 
            clickPhase={0.75}
            variant="outline"
            size="sm"
            highlight={testButtonHighlight}
          >
            Test Email
          </AnimatedMockButton>
          <AnimatedMockButton 
            phase={phase} 
            clickPhase={0.85}
            variant="outline"
            size="sm"
          >
            Test SMS
          </AnimatedMockButton>
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Test email sent!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 5: Update Password
export const PersonalStep5 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Password & Security" icon={Lock} phase={phase} revealPhase={0.1}>
        <div className="space-y-2">
          <AnimatedMockInput 
            label="Current Password" 
            value="••••••••" 
            phase={phase}
            startPhase={0}
            endPhase={0}
            type="password"
            disabled
          />
          <AnimatedMockInput 
            label="New Password" 
            value="NewSecure123!" 
            phase={phase}
            startPhase={0.2}
            endPhase={0.5}
            type="password"
          />
          <AnimatedMockInput 
            label="Confirm Password" 
            value="NewSecure123!" 
            phase={phase}
            startPhase={0.5}
            endPhase={0.75}
            type="password"
          />
        </div>
      </AnimatedFormSection>
    </div>
  );
};

// Step 6: Password Requirements
export const PersonalStep6 = ({ phase = 0 }: StepProps) => {
  const showRequirements = phase > 0.4;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Password & Security" icon={Lock} phase={phase} revealPhase={0.1}>
        <div className="space-y-3">
          <AnimatedPasswordStrength phase={phase} startPhase={0.2} />
          <AnimatePresence>
            {showRequirements && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-2 bg-muted/50 rounded text-xs space-y-1"
              >
                <p className="font-medium">Password requirements:</p>
                {[
                  { text: "Minimum 6 characters", delay: 0 },
                  { text: "Mix of letters and numbers recommended", delay: 0.1 },
                ].map((req, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: req.delay }}
                    className="flex items-center gap-2 text-muted-foreground"
                  >
                    <Check className="h-3 w-3 text-green-500" />
                    <span>{req.text}</span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </AnimatedFormSection>
      <AnimatedSuccessToast message="Password updated successfully!" phase={phase} showPhase={0.9} />
    </div>
  );
};

// Step 7: Select Date Format
export const PersonalStep7 = ({ phase = 0 }: StepProps) => {
  const showPreview = phase > 0.7;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Language & Localization" icon={Globe} phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">Date Format</span>
        </div>
        <AnimatedMockSelect
          label=""
          value="DD/MM/YYYY"
          options={["MM/DD/YYYY (US)", "DD/MM/YYYY (UK/AU)", "YYYY-MM-DD (ISO)", "DD-MMM-YYYY"]}
          phase={phase}
          openPhase={0.3}
          selectPhase={0.6}
        />
        <AnimatePresence>
          {showPreview && (
            <motion.div 
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-muted rounded text-xs"
            >
              <span className="text-muted-foreground">Preview: </span>
              <motion.span 
                className="font-medium"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                16/01/2026
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 8: Set Timezone
export const PersonalStep8 = ({ phase = 0 }: StepProps) => {
  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Language & Localization" icon={Globe} phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-2">
          <motion.div
            animate={phase > 0.3 ? { rotate: [0, 360] } : {}}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <Clock className="h-3 w-3 text-muted-foreground" />
          </motion.div>
          <span className="text-xs font-medium">Timezone</span>
        </div>
        <AnimatedMockSelect
          label=""
          value="Australia/Sydney (GMT+11)"
          options={["Australia/Sydney (GMT+11)", "Asia/Kolkata (GMT+5:30)", "America/New_York (GMT-5)", "Europe/London (GMT+0)"]}
          phase={phase}
          openPhase={0.3}
          selectPhase={0.6}
        />
        <motion.p 
          className="text-xs text-muted-foreground mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: phase > 0.7 ? 1 : 0 }}
        >
          Affects appointment times and scheduled notifications
        </motion.p>
      </AnimatedFormSection>
    </div>
  );
};

// Step 9: Language Settings
export const PersonalStep9 = ({ phase = 0 }: StepProps) => {
  const showComingSoon = phase > 0.5;

  return (
    <div className="space-y-3">
      <AnimatedFormSection title="Language & Localization" icon={Globe} phase={phase} revealPhase={0.1}>
        <div className="flex items-center gap-2 mb-2">
          <Languages className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs font-medium">Language</span>
        </div>
        <motion.div 
          className="bg-background border border-border rounded px-2 py-1.5 text-xs opacity-60"
          animate={phase > 0.3 ? { scale: [1, 1.02, 1] } : {}}
        >
          English (Default)
        </motion.div>
        <AnimatePresence>
          {showComingSoon && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs"
            >
              <motion.p 
                className="text-blue-600 dark:text-blue-400"
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                Additional languages coming soon. Contact support for custom language requirements.
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </AnimatedFormSection>
    </div>
  );
};

// Step 10: Save and Preview
export const PersonalStep10 = ({ phase = 0 }: StepProps) => {
  const showPreview = phase > 0.3;
  const saveHighlight = phase > 0.6 && phase < 0.85;
  const showSuccess = phase > 0.85;

  return (
    <div className="space-y-3">
      <AnimatedMockCard phase={phase} revealPhase={0.1}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-medium">Settings Preview</p>
            <p className="text-xs text-muted-foreground">Review before saving</p>
          </div>
        </div>
        <AnimatePresence>
          {showPreview && (
            <AnimatedPreviewBox
              phase={phase}
              startPhase={0.35}
              items={[
                { label: "Date Format", value: "16/01/2026" },
                { label: "Time", value: "2:30 PM AEST" },
                { label: "Timezone", value: "Australia/Sydney" },
              ]}
            />
          )}
        </AnimatePresence>
      </AnimatedMockCard>
      <motion.div 
        className="flex justify-end gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase > 0.5 ? 1 : 0 }}
      >
        <AnimatedMockButton phase={phase} variant="outline">
          Cancel
        </AnimatedMockButton>
        <AnimatedMockButton 
          phase={phase} 
          clickPhase={0.8}
          highlight={saveHighlight}
          icon={Save}
        >
          Save Profile
        </AnimatedMockButton>
      </motion.div>
      <AnimatedSuccessToast message="All settings saved successfully!" phase={phase} showPhase={0.85} />
    </div>
  );
};
