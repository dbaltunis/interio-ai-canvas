import type { Meta, StoryObj } from '@storybook/react';
import { DataTable } from './data-table';
import { Badge } from './badge';

const meta: Meta<typeof DataTable> = {
  title: 'UI/DataTable',
  component: DataTable,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

const sampleData = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    status: 'active',
    role: 'Admin',
    lastSeen: '2024-01-15',
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    status: 'inactive',
    role: 'User',
    lastSeen: '2024-01-14',
  },
  {
    id: '3',
    name: 'Bob Johnson',
    email: 'bob@example.com',
    status: 'active',
    role: 'Editor',
    lastSeen: '2024-01-16',
  },
];

const columns = [
  {
    key: 'name',
    label: 'Name',
    sortable: true,
  },
  {
    key: 'email',
    label: 'Email',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
    render: (value: string) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'} className={value === 'active' ? 'bg-success text-white' : ''}>
        {value}
      </Badge>
    ),
  },
  {
    key: 'role',
    label: 'Role',
  },
  {
    key: 'lastSeen',
    label: 'Last Seen',
    sortable: true,
  },
];

export const Default: Story = {
  args: {
    data: sampleData,
    columns: columns,
  },
};

export const Modern: Story = {
  args: {
    data: sampleData,
    columns: columns,
    variant: 'modern',
  },
};

export const Minimal: Story = {
  args: {
    data: sampleData,
    columns: columns,
    variant: 'minimal',
  },
};

export const WithClickHandler: Story = {
  args: {
    data: sampleData,
    columns: columns,
    onRowClick: (row) => alert(`Clicked on ${row.name}`),
  },
};

export const Empty: Story = {
  args: {
    data: [],
    columns: columns,
    emptyMessage: 'No users found',
  },
};

export const CustomColumns: Story = {
  args: {
    data: sampleData,
    columns: [
      {
        key: 'name',
        label: 'Full Name',
        render: (value: string, row: any) => (
          <div className="font-medium">{value}</div>
        ),
      },
      {
        key: 'email',
        label: 'Contact',
        render: (value: string) => (
          <a href={`mailto:${value}`} className="text-primary hover:underline">
            {value}
          </a>
        ),
      },
      {
        key: 'status',
        label: 'Account Status',
        render: (value: string) => (
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${value === 'active' ? 'bg-success' : 'bg-muted-foreground'}`} />
            <span className="capitalize">{value}</span>
          </div>
        ),
      },
    ],
  },
};