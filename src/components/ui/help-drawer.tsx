import React from 'react';
import { X, ExternalLink, Keyboard, Lightbulb, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface HelpSection {
  title: string;
  content: string;
  links?: Array<{
    text: string;
    href?: string;
    onClick?: () => void;
  }>;
}

interface HelpDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  sections: {
    purpose?: HelpSection;
    actions?: HelpSection;
    tips?: HelpSection;
    shortcuts?: Array<{
      key: string;
      description: string;
    }>;
  };
}

export const HelpDrawer = ({ isOpen, onClose, title, sections }: HelpDrawerProps) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}
      
      {/* Drawer */}
      <div className={cn(
        "fixed top-0 right-0 h-full w-96 bg-surface border-l border-default shadow-lg z-50 transform transition-transform duration-300 ease-out",
        isOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-default">
            <h3 className="text-h2 text-default">{title} Help</h3>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={onClose}
              className="text-muted hover:text-default"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Purpose */}
            {sections.purpose && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" />
                  <h4 className="text-small font-medium text-default">{sections.purpose.title}</h4>
                </div>
                <p className="text-small text-muted leading-relaxed">
                  {sections.purpose.content}
                </p>
                {sections.purpose.links && (
                  <div className="space-y-2">
                    {sections.purpose.links.map((link, index) => (
                      <button
                        key={index}
                        onClick={link.onClick}
                        className="flex items-center gap-2 text-small text-primary hover:text-primary-600 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Common Actions */}
            {sections.actions && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-accent" />
                  <h4 className="text-small font-medium text-default">{sections.actions.title}</h4>
                </div>
                <p className="text-small text-muted leading-relaxed">
                  {sections.actions.content}
                </p>
                {sections.actions.links && (
                  <div className="space-y-2">
                    {sections.actions.links.map((link, index) => (
                      <button
                        key={index}
                        onClick={link.onClick}
                        className="flex items-center gap-2 text-small text-primary hover:text-primary-600 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        {link.text}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tips */}
            {sections.tips && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-success" />
                  <h4 className="text-small font-medium text-default">{sections.tips.title}</h4>
                </div>
                <p className="text-small text-muted leading-relaxed">
                  {sections.tips.content}
                </p>
              </div>
            )}

            {/* Keyboard Shortcuts */}
            {sections.shortcuts && sections.shortcuts.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Keyboard className="h-4 w-4 text-warning" />
                  <h4 className="text-small font-medium text-default">Keyboard Shortcuts</h4>
                </div>
                <div className="space-y-2">
                  {sections.shortcuts.map((shortcut, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-small text-muted">{shortcut.description}</span>
                      <kbd className="px-2 py-1 text-caption bg-muted border border-default rounded">
                        {shortcut.key}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};