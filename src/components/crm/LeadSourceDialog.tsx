import { X } from "lucide-react";
import { LeadSourceManager } from "@/components/settings/LeadSourceManager";
import { useEffect } from "react";

interface LeadSourceDialogProps {
  open: boolean;
  onClose: () => void;
}

export const LeadSourceDialog = ({ open, onClose }: LeadSourceDialogProps) => {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 9998,
          animation: 'fadeIn 0.2s ease-out'
        }}
      />
      
      {/* Dialog Content */}
      <div
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 9999,
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '24px',
          overflow: 'auto',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '16px',
            top: '16px',
            padding: '8px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            zIndex: 10
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#ffffff';
          }}
        >
          <X size={20} color="#111827" />
        </button>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#111827',
            margin: 0
          }}>
            Manage Lead Sources
          </h2>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280',
            marginTop: '4px',
            margin: 0
          }}>
            Add, edit, and manage your custom lead sources
          </p>
        </div>

        {/* Content */}
        <LeadSourceManager />
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translate(-50%, -48%) scale(0.95);
          }
          to { 
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
        }
      `}</style>
    </>
  );
};
