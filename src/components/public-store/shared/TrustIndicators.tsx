import { Award, Clock, Shield, Star, Users } from "lucide-react";

const indicators = [
  {
    icon: Clock,
    value: "25+",
    label: "Years Experience"
  },
  {
    icon: Users,
    value: "14M+",
    label: "Windows Covered"
  },
  {
    icon: Star,
    value: "5.0",
    label: "Average Rating"
  },
  {
    icon: Shield,
    value: "100%",
    label: "Satisfaction Guaranteed"
  },
  {
    icon: Award,
    value: "ISO",
    label: "Certified Quality"
  },
];

export const TrustIndicators = () => {
  return (
    <section className="py-12 border-y bg-muted/30">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex p-3 rounded-full bg-primary/10 mb-3">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{indicator.value}</div>
                <div className="text-sm text-muted-foreground">{indicator.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
