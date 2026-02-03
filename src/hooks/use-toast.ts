
import * as React from "react"

import type {
  ToastActionElement,
  ToastProps,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 3000 // 3 seconds for success toasts
const ERROR_TOAST_REMOVE_DELAY = 15000 // 15 seconds for error toasts - readable duration

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  importance?: 'silent' | 'normal' | 'important' // Control notification visibility
  persistent?: boolean // If true, toast stays until manually dismissed
  icon?: string // Icon type for friendly errors
  showLoginButton?: boolean // Show login button for session errors
  onLoginClick?: () => void // Handler for login button
  autoDismissMs?: number // Custom auto-dismiss time
}

const actionTypes = {
  ADD_TOAST: "ADD_TOAST",
  UPDATE_TOAST: "UPDATE_TOAST",
  DISMISS_TOAST: "DISMISS_TOAST",
  REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ADD_TOAST"]
      toast: ToasterToast
    }
  | {
      type: ActionType["UPDATE_TOAST"]
      toast: Partial<ToasterToast>
    }
  | {
      type: ActionType["DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case "DISMISS_TOAST": {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      }
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type Toast = Omit<ToasterToast, "id">

function toast({ ...props }: Toast) {
  const id = genId()

  // Determine if this is an error toast
  const isError = props.variant === "destructive" || 
                  props.variant === "warning" ||
                  props.title?.toString().toLowerCase().includes("error") ||
                  props.title?.toString().toLowerCase().includes("failed");
  
  // Default to silent for non-error toasts unless explicitly marked as important
  const effectiveImportance = props.importance || (isError ? 'important' : 'silent');
  
  // Don't show silent notifications
  if (effectiveImportance === 'silent') {
    return {
      id: id,
      dismiss: () => {},
      update: () => {},
    }
  }

  const update = (props: ToasterToast) =>
    dispatch({
      type: "UPDATE_TOAST",
      toast: { ...props, id },
    })
  const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  
  // Check if this toast should be persistent (no auto-dismiss)
  const isPersistent = props.persistent === true;
  
  // Determine delay: persistent = no auto-dismiss, custom autoDismissMs, or defaults
  let delay: number;
  if (isPersistent) {
    delay = Infinity; // Never auto-dismiss
  } else if (props.autoDismissMs) {
    delay = props.autoDismissMs;
  } else if (isError) {
    delay = ERROR_TOAST_REMOVE_DELAY;
  } else if (effectiveImportance === 'important') {
    delay = 4000;
  } else {
    delay = TOAST_REMOVE_DELAY;
  }
  
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  if (delay !== Infinity) {
    timeout = setTimeout(() => {
      dismiss()
    }, delay);
  }

  dispatch({
    type: "ADD_TOAST",
    toast: {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) {
          if (timeout) clearTimeout(timeout)
          dismiss()
        }
      },
    },
  })

  return {
    id: id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  }
}

export { useToast, toast }
