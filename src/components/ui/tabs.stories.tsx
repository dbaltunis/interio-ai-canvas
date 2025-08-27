import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta: Meta<typeof Tabs> = {
  title: 'UI/Tabs',
  component: Tabs,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="tab1" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="tab1">Account</TabsTrigger>
        <TabsTrigger value="tab2">Password</TabsTrigger>
        <TabsTrigger value="tab3">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="tab1" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Account Information</h3>
          <p className="text-muted-foreground">Manage your account details here.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab2" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Password Settings</h3>
          <p className="text-muted-foreground">Change your password here.</p>
        </div>
      </TabsContent>
      <TabsContent value="tab3" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">General Settings</h3>
          <p className="text-muted-foreground">Configure your preferences.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

export const WithCounts: Story = {
  render: () => (
    <Tabs defaultValue="jobs" className="w-[500px]">
      <TabsList>
        <TabsTrigger value="jobs">Jobs (12)</TabsTrigger>
        <TabsTrigger value="clients">Clients (8)</TabsTrigger>
        <TabsTrigger value="emails">Emails (5)</TabsTrigger>
        <TabsTrigger value="analytics">Analytics</TabsTrigger>
      </TabsList>
      <TabsContent value="jobs" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Active Jobs</h3>
          <p className="text-muted-foreground">View and manage your current jobs.</p>
        </div>
      </TabsContent>
      <TabsContent value="clients" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Client Management</h3>
          <p className="text-muted-foreground">Manage your client relationships.</p>
        </div>
      </TabsContent>
      <TabsContent value="emails" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Email Center</h3>
          <p className="text-muted-foreground">Handle email communications.</p>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="mt-4">
        <div className="p-4 border rounded-md">
          <h3 className="text-lg font-semibold">Analytics Dashboard</h3>
          <p className="text-muted-foreground">View performance metrics.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};