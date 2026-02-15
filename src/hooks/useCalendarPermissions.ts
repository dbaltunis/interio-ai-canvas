import { useHasPermission } from "@/hooks/usePermissions";

export const useCalendarPermissions = () => {
  const canCreateAppointments = useHasPermission('create_appointments') !== false;

  return { canCreateAppointments, isPermissionLoaded: true };
};
