import { useState, useCallback } from 'react';

export interface EventDialogState {
  isOpen: boolean;
  mode: 'view' | 'edit' | 'create';
  selectedAppointment: any;
  selectedDate?: Date;
}

export const useEventDialog = () => {
  const [state, setState] = useState<EventDialogState>({
    isOpen: false,
    mode: 'view',
    selectedAppointment: null,
    selectedDate: undefined,
  });

  const openView = useCallback((appointment: any) => {
    setState({
      isOpen: true,
      mode: 'view',
      selectedAppointment: appointment,
      selectedDate: undefined,
    });
  }, []);

  const openEdit = useCallback((appointment: any) => {
    setState({
      isOpen: true,
      mode: 'edit',
      selectedAppointment: appointment,
      selectedDate: undefined,
    });
  }, []);

  const openCreate = useCallback((selectedDate?: Date) => {
    setState({
      isOpen: true,
      mode: 'create',
      selectedAppointment: null,
      selectedDate,
    });
  }, []);

  const changeMode = useCallback((mode: 'view' | 'edit') => {
    setState(prev => ({
      ...prev,
      mode,
    }));
  }, []);

  const close = useCallback(() => {
    setState({
      isOpen: false,
      mode: 'view',
      selectedAppointment: null,
      selectedDate: undefined,
    });
  }, []);

  return {
    ...state,
    openView,
    openEdit,
    openCreate,
    changeMode,
    close,
  };
};