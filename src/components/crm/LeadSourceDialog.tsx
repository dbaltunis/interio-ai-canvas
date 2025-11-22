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
          zIndex: 99998,
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
          zIndex: 99999,
          width: '90%',
          maxWidth: '1000px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideIn 0.2s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div style={{ 
          padding: '24px 24px 16px 24px',
          borderBottom: '1px solid #e5e7eb',
          flexShrink: 0
        }}>
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

        {/* Content - Scrollable */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '24px'
        }}>
          <LeadSourceManager />
        </div>
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
