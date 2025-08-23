import React, { createContext, useContext, ReactNode } from 'react';

// Mock data types
export interface DemoClient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  projectsCount: number;
  totalValue: number;
  status: 'active' | 'inactive';
  lastContact: string;
}

export interface DemoProject {
  id: string;
  title: string;
  clientId: string;
  clientName: string;
  status: 'planning' | 'in-progress' | 'completed' | 'on-hold';
  value: number;
  startDate: string;
  endDate: string;
  description: string;
  rooms: DemoRoom[];
}

export interface DemoRoom {
  id: string;
  name: string;
  measurements: {
    width: number;
    height: number;
    depth?: number;
  };
  treatments: DemoTreatment[];
}

export interface DemoTreatment {
  id: string;
  type: string;
  fabric: string;
  price: number;
  description: string;
}

export interface DemoProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  image: string;
  description: string;
  inStock: boolean;
}

export interface DemoEmail {
  id: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  content: string;
  type: 'quote' | 'follow-up' | 'marketing' | 'support';
  status: 'sent' | 'draft' | 'scheduled';
}

export interface DemoEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'consultation' | 'installation' | 'follow-up' | 'meeting';
  clientName: string;
  description: string;
}

export interface DemoTeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  avatar: string;
  status: 'online' | 'offline' | 'busy';
  currentProject: string;
}

interface DemoContextType {
  clients: DemoClient[];
  projects: DemoProject[];
  products: DemoProduct[];
  emails: DemoEmail[];
  events: DemoEvent[];
  teamMembers: DemoTeamMember[];
  dashboardStats: {
    totalRevenue: number;
    activeProjects: number;
    totalClients: number;
    completedProjects: number;
  };
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const useDemoData = () => {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemoData must be used within DemoDataProvider');
  }
  return context;
};

export const DemoDataProvider = ({ children }: { children: ReactNode }) => {
  const clients: DemoClient[] = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      phone: '+1 (555) 123-4567',
      address: '123 Maple Street, Downtown District',
      projectsCount: 3,
      totalValue: 15000,
      status: 'active',
      lastContact: '2024-01-15'
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      phone: '+1 (555) 234-5678',
      address: '456 Oak Avenue, Uptown',
      projectsCount: 2,
      totalValue: 22000,
      status: 'active',
      lastContact: '2024-01-10'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.rodriguez@email.com',
      phone: '+1 (555) 345-6789',
      address: '789 Pine Road, Suburbia',
      projectsCount: 1,
      totalValue: 8500,
      status: 'active',
      lastContact: '2024-01-08'
    }
  ];

  const projects: DemoProject[] = [
    {
      id: '1',
      title: 'Modern Living Room Transformation',
      clientId: '1',
      clientName: 'Sarah Johnson',
      status: 'in-progress',
      value: 8500,
      startDate: '2024-01-01',
      endDate: '2024-02-15',
      description: 'Complete living room makeover with custom curtains and blinds',
      rooms: [
        {
          id: '1',
          name: 'Living Room',
          measurements: { width: 4.5, height: 2.8 },
          treatments: [
            {
              id: '1',
              type: 'Curtains',
              fabric: 'Silk Blend',
              price: 1200,
              description: 'Custom made silk blend curtains with blackout lining'
            }
          ]
        }
      ]
    },
    {
      id: '2',
      title: 'Executive Office Blinds',
      clientId: '2',
      clientName: 'Michael Chen',
      status: 'planning',
      value: 12000,
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      description: 'Professional motorized blinds for corporate office',
      rooms: [
        {
          id: '2',
          name: 'Conference Room',
          measurements: { width: 6.0, height: 3.2 },
          treatments: [
            {
              id: '2',
              type: 'Motorized Blinds',
              fabric: 'Blackout',
              price: 2500,
              description: 'Smart motorized blinds with app control'
            }
          ]
        }
      ]
    },
    {
      id: '3',
      title: 'Bedroom Window Treatments',
      clientId: '3',
      clientName: 'Emily Rodriguez',
      status: 'completed',
      value: 3500,
      startDate: '2023-12-01',
      endDate: '2024-01-05',
      description: 'Elegant bedroom curtains with thermal lining',
      rooms: [
        {
          id: '3',
          name: 'Master Bedroom',
          measurements: { width: 3.5, height: 2.5 },
          treatments: [
            {
              id: '3',
              type: 'Thermal Curtains',
              fabric: 'Cotton Blend',
              price: 850,
              description: 'Energy efficient thermal curtains'
            }
          ]
        }
      ]
    }
  ];

  const products: DemoProduct[] = [
    {
      id: '1',
      name: 'Premium Silk Curtains',
      category: 'Curtains',
      price: 120,
      image: '/demo-curtains-1.jpg',
      description: 'Luxurious silk curtains with custom sizing',
      inStock: true
    },
    {
      id: '2',
      name: 'Motorized Roller Blinds',
      category: 'Blinds',
      price: 250,
      image: '/demo-blinds-1.jpg',
      description: 'Smart home compatible motorized blinds',
      inStock: true
    },
    {
      id: '3',
      name: 'Blackout Panels',
      category: 'Panels',
      price: 85,
      image: '/demo-panels-1.jpg',
      description: 'Complete light blocking panels',
      inStock: false
    }
  ];

  const emails: DemoEmail[] = [
    {
      id: '1',
      subject: 'Quote Request Follow-up',
      from: 'demo@interioapp.com',
      to: 'sarah.johnson@email.com',
      date: '2024-01-15',
      content: 'Thank you for your interest in our window treatments...',
      type: 'follow-up',
      status: 'sent'
    },
    {
      id: '2',
      subject: 'New Collection Launch',
      from: 'demo@interioapp.com',
      to: 'all-clients@list.com',
      date: '2024-01-14',
      content: 'Discover our latest collection of premium fabrics...',
      type: 'marketing',
      status: 'scheduled'
    }
  ];

  const events: DemoEvent[] = [
    {
      id: '1',
      title: 'Initial Consultation',
      date: '2024-01-20',
      time: '10:00 AM',
      type: 'consultation',
      clientName: 'Sarah Johnson',
      description: 'Discuss living room requirements and measurements'
    },
    {
      id: '2',
      title: 'Installation Appointment',
      date: '2024-01-22',
      time: '2:00 PM',
      type: 'installation',
      clientName: 'Michael Chen',
      description: 'Install motorized blinds in conference room'
    }
  ];

  const teamMembers: DemoTeamMember[] = [
    {
      id: '1',
      name: 'Alex Thompson',
      role: 'Senior Designer',
      email: 'alex@interioapp.com',
      avatar: '/demo-avatar-1.jpg',
      status: 'online',
      currentProject: 'Modern Living Room Transformation'
    },
    {
      id: '2',
      name: 'Maria Garcia',
      role: 'Project Manager',
      email: 'maria@interioapp.com',
      avatar: '/demo-avatar-2.jpg',
      status: 'busy',
      currentProject: 'Executive Office Blinds'
    }
  ];

  const dashboardStats = {
    totalRevenue: 125000,
    activeProjects: 8,
    totalClients: 25,
    completedProjects: 47
  };

  const value = {
    clients,
    projects,
    products,
    emails,
    events,
    teamMembers,
    dashboardStats
  };

  return (
    <DemoContext.Provider value={value}>
      {children}
    </DemoContext.Provider>
  );
};