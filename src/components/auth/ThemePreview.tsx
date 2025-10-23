import { Calendar, FileText, Users, BarChart3 } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface ThemePreviewProps {
  previewTheme: 'light' | 'dark';
}

export const ThemePreview = ({ previewTheme }: ThemePreviewProps) => {
  const features = [
    {
      icon: Calendar,
      title: 'Job Management',
      description: 'Track projects seamlessly',
      delay: '0s',
    },
    {
      icon: FileText,
      title: 'Smart Quotations',
      description: 'Professional estimates',
      delay: '0.2s',
    },
    {
      icon: Users,
      title: 'Client Portal',
      description: 'Collaborate effortlessly',
      delay: '0.4s',
    },
    {
      icon: BarChart3,
      title: 'Analytics',
      description: 'Insights that matter',
      delay: '0.6s',
    },
  ];

  const isDark = previewTheme === 'dark';

  return (
    <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto px-6">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card
            key={index}
            className={`
              p-6 border backdrop-blur-sm transition-all duration-300 hidden sm:block
              ${isDark 
                ? 'bg-white/5 border-white/10 text-white' 
                : 'bg-white/80 border-primary/20 text-foreground'
              }
            `}
          >
            <Icon className={`w-8 h-8 mb-3 ${isDark ? 'text-primary-light' : 'text-primary'}`} />
            <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
            <p className={`text-sm ${isDark ? 'text-white/70' : 'text-muted-foreground'}`}>
              {feature.description}
            </p>
          </Card>
        );
      })}
    </div>
  );
};
