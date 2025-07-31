import { useState, useCallback } from 'react';

export interface AppointmentEditState {
  isQuickEditOpen: boolean;
  isAdvancedEditOpen: boolean;
  selectedAppointment: any;
}

export const useAppointmentEdit = () => {
  const [state, setState] = useState<AppointmentEditState>({
    isQuickEditOpen: false,
    isAdvancedEditOpen: false,
    selectedAppointment: null,
  });

  const openQuickEdit = useCallback((appointment: any) => {
    setState({
      isQuickEditOpen: true,
      isAdvancedEditOpen: false,
      selectedAppointment: appointment,
    });
  }, []);

  const openAdvancedEdit = useCallback((appointment?: any) => {
    setState(prev => ({
      isQuickEditOpen: false,
      isAdvancedEditOpen: true,
      selectedAppointment: appointment || prev.selectedAppointment,
    }));
  }, []);

  const closeEdit = useCallback(() => {
    setState({
      isQuickEditOpen: false,
      isAdvancedEditOpen: false,
      selectedAppointment: null,
    });
  }, []);

  const saveAppointment = useCallback((appointment: any) => {
    // Here you would typically save to your backend/state management
    console.log('Saving appointment:', appointment);
    closeEdit();
  }, [closeEdit]);

  return {
    ...state,
    openQuickEdit,
    openAdvancedEdit,
    closeEdit,
    saveAppointment,
  };
};