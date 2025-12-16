import { motion } from 'framer-motion';
import { X, Link2, Eye, Layers, Upload, Sparkles, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FeatureCard } from './FeatureCard';
import { FlowDiagram } from './FlowDiagram';
import { InteractiveShowcase } from './InteractiveShowcase';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

interface PricingSystemGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingSystemGuide = ({ isOpen, onClose }: PricingSystemGuideProps) => {
  if (!isOpen) return null;

  const features = [
    {
      icon: Link2,
      title: "Smart Matching",
      description: "Price Group links grids to inventory materials automatically. Set it once, pricing flows everywhere."
    },
    {
      icon: Eye,
      title: "Real-Time Preview",
      description: "See exactly how many materials will use this grid before you create it. No guesswork."
    },
    {
      icon: Layers,
      title: "Markup Hierarchy",
      description: "Grid markup → Category markup → Global default. The most specific setting always wins."
    },
    {
      icon: Upload,
      title: "Bulk Upload",
      description: "Upload pricing matrices via CSV. Width × Drop grids are parsed and stored automatically."
    }
  ];

  const faqItems = [
    {
      question: "How do I upload a pricing grid?",
      answer: "Click 'Add New Grid', select the Treatment Type (e.g., Roller Blinds), enter a unique Price Group identifier, and upload your CSV file. The CSV should have widths as columns and drops as rows, with prices in each cell."
    },
    {
      question: "What is a Price Group and why is it important?",
      answer: "Price Group is the KEY linking field. When you assign a Price Group to a grid (e.g., 'ROLLER-GROUP1'), any inventory material with the same price_group value will automatically use that grid for pricing. This is how the system knows which prices apply to which materials."
    },
    {
      question: "How do I link materials to a pricing grid?",
      answer: "In your inventory, edit the material and set its 'Price Group' field to match the grid's Price Group. For example, if your grid has Price Group 'VENETIAN-WOOD-50', set the same value on all 50mm wooden venetian slat materials."
    },
    {
      question: "How does markup work with grids?",
      answer: "Markup follows a hierarchy: Grid-specific markup (if set) → Category markup → Global default. You can set different markups for different grids, or leave it blank to use category/global defaults."
    },
    {
      question: "Can I have multiple grids for the same treatment type?",
      answer: "Yes! You can have unlimited grids per treatment type. Each grid should have a unique Price Group. For example: 'VENETIAN-WOOD-25', 'VENETIAN-WOOD-50', 'VENETIAN-ALUMINIUM' - all are Venetian Blinds but with different price groups for different product variants."
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-4 md:inset-8 lg:inset-12 bg-background rounded-2xl border border-border shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Pricing System Guide</h2>
              <p className="text-sm text-muted-foreground">Learn how pricing grids work</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        <ScrollArea className="h-[calc(100%-73px)]">
          <div className="px-6 py-8 space-y-16">
            {/* Hero Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-3xl mx-auto"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                <Sparkles className="w-4 h-4" />
                Pricing Made Simple
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                Pricing Grids Connect Your
                <span className="text-primary"> Inventory to Quotes</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Upload your pricing matrices once, link them to materials via Price Group, 
                and watch your quotes calculate automatically. No manual price entry needed.
              </p>
            </motion.section>

            {/* Flow Diagram */}
            <section className="bg-muted/30 rounded-2xl p-6 md:p-8">
              <FlowDiagram />
            </section>

            {/* Interactive Showcase */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  The Upload Form Explained
                </h2>
                <p className="text-muted-foreground">
                  Hover over each field to understand what it does
                </p>
              </motion.div>
              <InteractiveShowcase />
            </section>

            {/* Feature Cards */}
            <section>
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Key Features
                </h2>
                <p className="text-muted-foreground">
                  Everything you need for efficient pricing management
                </p>
              </motion.div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <FeatureCard {...feature} />
                  </motion.div>
                ))}
              </div>
            </section>

            {/* FAQ / Step by Step */}
            <section className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-center mb-8"
              >
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  Frequently Asked Questions
                </h2>
                <p className="text-muted-foreground">
                  Quick answers to common questions
                </p>
              </motion.div>
              
              <Accordion type="single" collapsible className="space-y-2">
                {faqItems.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <AccordionItem value={`item-${index}`} className="border border-border rounded-lg px-4 bg-card">
                      <AccordionTrigger className="text-left hover:no-underline">
                        <span className="font-medium text-foreground">{item.question}</span>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            </section>

            {/* CTA */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center py-8"
            >
              <div className="inline-flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={onClose}>
                  Start Adding Grids
                </Button>
                <Button size="lg" variant="outline" onClick={onClose}>
                  Close Guide
                </Button>
              </div>
            </motion.section>
          </div>
        </ScrollArea>
      </motion.div>
    </motion.div>
  );
};
