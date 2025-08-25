import { ClientManagementPage } from "../clients/ClientManagementPage";

interface ClientManagementProps {
  onTabChange?: (tab: string) => void;
}

export const ClientManagement = ({ onTabChange }: ClientManagementProps = {}) => {
  return <ClientManagementPage onTabChange={onTabChange} />;
};

export default ClientManagement;