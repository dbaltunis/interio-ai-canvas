import { useEffect, useRef } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

export const useSessionTimeout = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const timeoutRef = useRef<NodeJS.Timeout>();
  const warningRef = useRef<NodeJS.Timeout>();
  const lastActivityRef = useRef(Date.now());

  const resetTimer = () => {
    lastActivityRef.current = Date.now();
    
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningRef.current) clearTimeout(warningRef.current);

    if (!user) return;

    // Show warning 5 minutes before timeout
    warningRef.current = setTimeout(() => {
      toast({
        title: "Session Expiring Soon",
        description: "Your session will expire in 5 minutes. Please save your work.",
        variant: "default",
      });
    }, SESSION_TIMEOUT - WARNING_TIME);

    // Logout user after timeout
    timeoutRef.current = setTimeout(() => {
      signOut();
      toast({
        title: "Session Expired",
        description: "Your session has expired. Please log in again.",
        variant: "destructive",
      });
      navigate("/auth");
    }, SESSION_TIMEOUT);
  };

  useEffect(() => {
    if (!user) return;

    // Track user activity
    const activities = ["mousedown", "keydown", "scroll", "touchstart"];
    
    activities.forEach((activity) => {
      document.addEventListener(activity, resetTimer);
    });

    resetTimer(); // Initialize timer

    return () => {
      activities.forEach((activity) => {
        document.removeEventListener(activity, resetTimer);
      });
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningRef.current) clearTimeout(warningRef.current);
    };
  }, [user]);

  return {
    resetSession: resetTimer,
    lastActivity: lastActivityRef.current,
  };
};
