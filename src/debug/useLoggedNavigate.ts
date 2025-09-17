// debug/useLoggedNavigate.ts
import { useNavigate } from 'react-router-dom';

export function useLoggedNavigate() {
  const navigate = useNavigate();
  return (to: any, opts?: any) => {
    console.warn('[NAV] react-router navigate ->', to, opts, new Error().stack);
    return navigate(to, opts);
  };
}