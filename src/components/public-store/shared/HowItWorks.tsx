import { Calculator, Calendar, Hammer, Sparkles } from "lucide-react";

const steps = [
  {
    icon: Calculator,
    title: "Use Our Calculator",
    description: "Enter your measurements and see instant pricing with our interactive visual calculator"
  },
  {
    icon: Calendar,
    title: "Book Consultation",
    description: "Schedule a free in-home or virtual consultation with our design experts"
  },
  {
    icon: Hammer,
    title: "Expert Making",
    description: "Your treatments are custom made by our skilled craftspeople to exact specifications"
  },
  {
    icon: Sparkles,
    title: "Professional Install",
    description: "White-glove installation service ensures perfect fitting and finish"
  },
];

export const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">How It Works</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            From design to installation, we make the process simple and stress-free
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg z-10">
                  {index + 1}
                </div>

                {/* Card */}
                <div className="bg-muted/50 rounded-lg p-6 pt-8 h-full border-2 border-transparent hover:border-primary transition-colors">
                  <div className="mb-4">
                    <div className="inline-flex p-3 rounded-lg bg-primary/10">
                      <Icon className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Connector Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-10 left-full w-8 h-0.5 bg-primary/30 -translate-x-1/2" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
