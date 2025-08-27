import type { Meta, StoryObj } from '@storybook/react';
import { Input } from './input';
import { Label } from './label';
import { Search as SearchIcon, Mail } from 'lucide-react';

const meta: Meta<typeof Input> = {
  title: 'UI/Input',
  component: Input,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'number', 'search', 'url', 'tel'],
    },
    disabled: {
      control: 'boolean',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: 'Enter text...',
  },
};

export const WithLabel: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input
        id="email"
        type="email"
        placeholder="Enter your email"
      />
    </div>
  ),
};

export const Password: Story = {
  args: {
    type: 'password',
    placeholder: 'Enter password',
  },
};

export const SearchInput: Story = {
  render: () => (
    <div className="relative">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder="Search..."
        type="search"
      />
    </div>
  ),
};

export const WithIcon: Story = {
  render: () => (
    <div className="relative">
      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        className="pl-10"
        placeholder="Enter email address"
        type="email"
      />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: 'Disabled input',
    disabled: true,
  },
};

export const WithError: Story = {
  render: () => (
    <div className="space-y-2">
      <Label htmlFor="error-input">Email</Label>
      <Input
        id="error-input"
        type="email"
        placeholder="Enter your email"
        className="border-error focus:border-error focus:ring-error/20"
      />
      <p className="text-sm text-error">Please enter a valid email address.</p>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => (
    <div className="space-y-6 w-[300px]">
      <div className="space-y-2">
        <Label>Default</Label>
        <Input placeholder="Default input" />
      </div>
      
      <div className="space-y-2">
        <Label>Focused (try clicking)</Label>
        <Input placeholder="Focus to see ring" />
      </div>
      
      <div className="space-y-2">
        <Label>Disabled</Label>
        <Input placeholder="Disabled input" disabled />
      </div>
      
      <div className="space-y-2">
        <Label>With Icon</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input className="pl-10" placeholder="Email address" />
        </div>
      </div>
    </div>
  ),
};