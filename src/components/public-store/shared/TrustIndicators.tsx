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
    <section className="py-16 border-y bg-gradient-to-r from-primary/5 via-background to-accent/5">
      <div className="container">
        <div className="text-center mb-10">
          <h3 className="text-2xl md:text-3xl font-bold mb-2">Why Choose Us</h3>
          <p className="text-muted-foreground">Trusted by thousands of satisfied customers</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {indicators.map((indicator, index) => {
            const Icon = indicator.icon;
            return (
              <div key={index} className="text-center group">
                <div className="inline-flex p-4 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4 group-hover:scale-110 transition-transform">
                  <Icon className="h-8 w-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {indicator.value}
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  {indicator.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
