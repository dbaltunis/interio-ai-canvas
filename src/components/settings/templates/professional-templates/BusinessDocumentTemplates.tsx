export const standardInvoiceTemplate = {
  id: 'standard-invoice',
  name: 'Standard Invoice',
  description: 'Clean, straightforward invoice layout',
  documentType: 'invoice',
  blocks: [
    {
      id: 'invoice-header',
      type: 'header',
      content: {
        layout: 'invoice-professional',
        showLogo: true,
        logoPosition: 'left',
        documentTitle: 'INVOICE',
        companyName: '{{company_name}}',
        companyAddress: '{{company_address}}',
        companyPhone: '{{company_phone}}',
        companyEmail: '{{company_email}}',
        style: {
          primaryColor: '#dc2626',
          backgroundColor: '#ffffff',
          titleColor: '#dc2626',
          titleSize: '32px',
          fontFamily: 'Inter, sans-serif'
        }
      },
      editable: true
    },
    {
      id: 'invoice-details',
      type: 'invoice-info',
      content: {
        invoiceNumber: '{{invoice_number}}',
        invoiceDate: '{{invoice_date}}',
        dueDate: '{{due_date}}',
        poNumber: '{{po_number}}',
        layout: 'professional-grid',
        style: {
          backgroundColor: '#fef2f2',
          borderColor: '#dc2626',
          padding: '20px'
        }
      },
      editable: true
    },
    {
      id: 'billing-info',
      type: 'billing-details',
      content: {
        billToTitle: 'Bill To:',
        shipToTitle: 'Ship To:',
        showBillTo: true,
        showShipTo: false,
        clientName: '{{client_name}}',
        clientCompany: '{{client_company}}',
        clientAddress: '{{client_address}}',
        clientEmail: '{{client_email}}',
        style: {
          layout: 'side-by-side',
          backgroundColor: '#ffffff'
        }
      },
      editable: true
    },
    {
      id: 'invoice-items',
      type: 'invoice-products',
      content: {
        layout: 'standard-table',
        columns: ['Description', 'Quantity', 'Rate', 'Amount'],
        showTax: true,
        tableStyle: 'clean-lines',
        style: {
          headerBackgroundColor: '#dc2626',
          headerTextColor: '#ffffff',
          alternateRowColor: '#f9fafb'
        }
      },
      editable: true
    },
    {
      id: 'invoice-totals',
      type: 'invoice-totals',
      content: {
        showSubtotal: true,
        showDiscount: false,
        showTax: true,
        showTotal: true,
        currency: '£',
        style: {
          alignment: 'right',
          totalHighlight: '#dc2626',
          backgroundColor: '#fef2f2'
        }
      },
      editable: true
    },
    {
      id: 'payment-terms',
      type: 'payment-info',
      content: {
        title: 'Payment Information',
        terms: 'Payment is due within 30 days of invoice date.',
        methods: 'We accept bank transfer, cheque, or card payments.',
        bankDetails: {
          accountName: '{{company_name}}',
          accountNumber: 'XXXXXXXXXX',
          sortCode: 'XX-XX-XX',
          reference: '{{invoice_number}}'
        },
        style: {
          backgroundColor: '#f9fafb',
          borderColor: '#e5e7eb'
        }
      },
      editable: true
    }
  ]
};

export const installerWorkOrderTemplate = {
  id: 'installer-workorder',
  name: 'Installer Work Order',
  description: 'Detailed instructions for installation teams',
  documentType: 'work-order',
  blocks: [
    {
      id: 'workorder-header',
      type: 'header',
      content: {
        layout: 'workorder-header',
        documentTitle: 'INSTALLATION WORK ORDER',
        workOrderNumber: '{{work_order_number}}',
        companyName: '{{company_name}}',
        companyPhone: '{{company_phone}}',
        emergencyContact: '{{emergency_contact}}',
        style: {
          primaryColor: '#ea580c',
          backgroundColor: '#ffffff',
          titleColor: '#ea580c',
          urgencyLevel: 'standard'
        }
      },
      editable: true
    },
    {
      id: 'job-overview',
      type: 'job-summary',
      content: {
        jobNumber: '{{job_number}}',
        clientName: '{{client_name}}',
        installationAddress: '{{installation_address}}',
        scheduledDate: '{{scheduled_date}}',
        estimatedDuration: '{{estimated_duration}}',
        teamAssigned: '{{team_assigned}}',
        priority: 'Standard',
        style: {
          layout: 'info-cards',
          backgroundColor: '#fff7ed',
          priorityColors: {
            urgent: '#dc2626',
            high: '#ea580c',
            standard: '#059669'
          }
        }
      },
      editable: true
    },
    {
      id: 'installation-items',
      type: 'installation-checklist',
      content: {
        title: 'Items to Install',
        items: [
          {
            room: 'Living Room',
            product: 'Made to Measure Curtains',
            quantity: 2,
            measurements: 'W: 150cm x H: 220cm',
            notes: 'Bay window installation - brackets provided',
            complexity: 'Medium'
          },
          {
            room: 'Kitchen',
            product: 'Venetian Blinds',
            quantity: 3,
            measurements: 'W: 80cm x H: 120cm',
            notes: 'Recess fit, existing brackets to be removed',
            complexity: 'Low'
          }
        ],
        style: {
          layout: 'detailed-checklist',
          complexityColors: {
            low: '#059669',
            medium: '#ea580c',
            high: '#dc2626'
          }
        }
      },
      editable: true
    },
    {
      id: 'tools-materials',
      type: 'requirements-checklist',
      content: {
        title: 'Tools & Materials Required',
        categories: [
          {
            category: 'Tools',
            items: ['Drill', 'Spirit level', 'Measuring tape', 'Screwdrivers', 'Wall plugs']
          },
          {
            category: 'Safety Equipment',
            items: ['Safety glasses', 'Dust sheets', 'Vacuum cleaner', 'Ladder/steps']
          },
          {
            category: 'Materials Provided',
            items: ['All brackets and fixings', 'Instruction manuals', 'Warranty cards']
          }
        ],
        style: {
          layout: 'categorized-lists',
          backgroundColor: '#f0fdf4'
        }
      },
      editable: true
    },
    {
      id: 'special-instructions',
      type: 'special-notes',
      content: {
        title: 'Special Instructions',
        instructions: [
          'Client has small children - please ensure all fixings are secure',
          'Property has listed building restrictions - drill carefully',
          'Client works from home - please keep noise to minimum before 9am',
          'Parking available in driveway - use side entrance'
        ],
        warningNotes: [
          'Asbestos survey completed - no issues identified',
          'Client has allergies to dust - use dust sheets'
        ],
        style: {
          backgroundColor: '#fefce8',
          warningColor: '#dc2626',
          instructionColor: '#059669'
        }
      },
      editable: true
    },
    {
      id: 'completion-checklist',
      type: 'completion-form',
      content: {
        title: 'Installation Completion Checklist',
        items: [
          'All items installed according to specifications',
          'All fixings secure and level',
          'Products operate correctly',
          'Area cleaned and tidied',
          'Client demonstration completed',
          'Warranty information provided',
          'Client signature obtained'
        ],
        signatureSection: {
          installerSignature: true,
          clientSignature: true,
          dateCompleted: true,
          timeCompleted: true
        },
        style: {
          backgroundColor: '#f0f9ff',
          checkboxStyle: 'modern'
        }
      },
      editable: true
    }
  ]
};

export const measurementSheetTemplate = {
  id: 'standard-measurement',
  name: 'Standard Measurement',
  description: 'Room-by-room measurement documentation',
  documentType: 'measurement',
  blocks: [
    {
      id: 'measurement-header',
      type: 'header',
      content: {
        layout: 'measurement-header',
        documentTitle: 'MEASUREMENT SHEET',
        jobNumber: '{{job_number}}',
        clientName: '{{client_name}}',
        measurementDate: '{{measurement_date}}',
        measuredBy: '{{measured_by}}',
        style: {
          primaryColor: '#0891b2',
          backgroundColor: '#ffffff',
          gridLines: true
        }
      },
      editable: true
    },
    {
      id: 'property-details',
      type: 'property-info',
      content: {
        propertyAddress: '{{client_address}}',
        propertyType: 'Residential',
        windowType: 'Mixed',
        constructionYear: '',
        specialConsiderations: '',
        style: {
          layout: 'form-grid',
          backgroundColor: '#f0f9ff'
        }
      },
      editable: true
    },
    {
      id: 'room-measurements',
      type: 'measurement-grid',
      content: {
        title: 'Window Measurements',
        rooms: [
          {
            roomName: 'Living Room',
            windows: [
              {
                windowId: 'LR-W1',
                description: 'Bay window - center panel',
                width: '',
                height: '',
                depth: '',
                notes: 'Radiator below - clearance 15cm'
              },
              {
                windowId: 'LR-W2',
                description: 'Bay window - left panel',
                width: '',
                height: '',
                depth: '',
                notes: 'Angled at 45 degrees'
              }
            ]
          }
        ],
        measurementUnits: 'cm',
        style: {
          layout: 'technical-grid',
          showSketchArea: true,
          backgroundColor: '#ffffff'
        }
      },
      editable: true
    },
    {
      id: 'sketch-area',
      type: 'measurement-sketch',
      content: {
        title: 'Window Sketches & Diagrams',
        sketchAreas: [
          {
            roomName: 'Living Room',
            sketchType: 'window-elevation',
            gridSize: '1cm',
            notes: 'Mark all obstacles, switches, and architectural features'
          }
        ],
        style: {
          gridPattern: 'technical',
          backgroundColor: '#fafafa',
          borderColor: '#0891b2'
        }
      },
      editable: true
    },
    {
      id: 'technical-notes',
      type: 'technical-specifications',
      content: {
        title: 'Technical Notes & Considerations',
        categories: [
          {
            category: 'Fixing Method',
            notes: 'All windows suitable for bracket fixing. No drilling restrictions noted.'
          },
          {
            category: 'Access Requirements',
            notes: 'Standard ladder access sufficient. No height restrictions.'
          },
          {
            category: 'Special Considerations',
            notes: 'Listed building - conservation area restrictions apply to external fixings.'
          }
        ],
        recommendedProducts: [
          'Made to measure curtains with ceiling fix brackets',
          'Motorized blinds for hard-to-reach windows'
        ],
        style: {
          backgroundColor: '#f0f9ff',
          technicalFont: 'monospace'
        }
      },
      editable: true
    }
  ]
};