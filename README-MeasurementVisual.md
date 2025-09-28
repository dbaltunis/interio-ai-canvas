# Reusable Measurement Visual System

A comprehensive, reusable visual measurement component system that can be used consistently across your application for displaying window measurements, treatment information, and project details.

## Features

- **Consistent Visual Design**: Same look and feel across all contexts
- **Flexible Configuration**: Multiple pre-built configurations for different use cases
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Fabric Calculations**: Built-in fabric usage and cost calculations
- **Project Integration**: Seamless integration with project, client, and room data
- **Responsive Design**: Works across different screen sizes
- **Modular Architecture**: Easy to extend and customize

## Quick Start

```tsx
import { 
  MeasurementVisual, 
  PreviewMeasurementVisual,
  EditableMeasurementVisual 
} from '@/components/shared/measurement-visual';

// Basic usage
<PreviewMeasurementVisual
  measurements={{
    rail_width: "200",
    drop: "250",
    window_type: "standard"
  }}
  projectData={{
    name: "Living Room Project",
    client: { id: "1", name: "John Smith" }
  }}
/>
```

## Pre-built Components

### 1. PreviewMeasurementVisual
Read-only view with calculations, perfect for client previews and quotes.

```tsx
<PreviewMeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
/>
```

### 2. EditableMeasurementVisual
Full editing interface with measurement inputs, fabric selection, and calculations.

```tsx
<EditableMeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
  onMeasurementChange={handleMeasurementChange}
  onTreatmentChange={handleTreatmentChange}
  onCalculationChange={handleCalculationChange}
/>
```

### 3. CompactMeasurementVisual
Compact version for list views and summary displays.

```tsx
<CompactMeasurementVisual
  measurements={measurements}
  projectData={projectData}
/>
```

### 4. WorkOrderMeasurementVisual
Formatted for work orders and production documents.

```tsx
<WorkOrderMeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
/>
```

## Custom Configuration

Use the base `MeasurementVisual` component with custom configuration:

```tsx
<MeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
  config={{
    showMeasurementInputs: true,
    showFabricSelection: true,
    showCalculations: true,
    readOnly: false,
    customTitle: "Custom Window Measurement"
  }}
  onMeasurementChange={handleChange}
/>
```

## Data Structures

### MeasurementData
```tsx
interface MeasurementData {
  rail_width?: string;
  drop?: string;
  stackback_left?: string;
  stackback_right?: string;
  returns?: string;
  pooling_amount?: string;
  pooling_option?: string;
  window_type?: string;
  curtain_type?: string;
  curtain_side?: string;
  hardware_type?: string;
  [key: string]: any;
}
```

### TreatmentData
```tsx
interface TreatmentData {
  template?: {
    id: string;
    name: string;
    curtain_type: string;
    fullness_ratio: number;
    // ... manufacturing settings
  };
  fabric?: {
    id: string;
    name: string;
    fabric_width: number;
    price_per_meter: number;
  };
  // ... lining and heading options
}
```

### ProjectData
```tsx
interface ProjectData {
  id?: string;
  name?: string;
  client?: {
    id: string;
    name: string;
    email?: string;
    company_name?: string;
    address?: string;
    phone?: string;
  };
  room?: {
    id: string;
    name: string;
    room_type?: string;
  };
  window?: {
    id: string;
    type: string;
    width?: string;
    height?: string;
    position?: string;
  };
}
```

## Pre-built Configurations

```tsx
import { VISUAL_CONFIGS } from '@/components/shared/measurement-visual';

// Available configurations:
VISUAL_CONFIGS.PREVIEW        // Read-only with calculations
VISUAL_CONFIGS.COMPACT        // Compact view
VISUAL_CONFIGS.EDITABLE       // Full editing interface
VISUAL_CONFIGS.WORK_ORDER     // Work order format
VISUAL_CONFIGS.CLIENT_PREVIEW // Client-facing preview
VISUAL_CONFIGS.QUOTE_DISPLAY  // Quote presentation
```

## Integration Examples

### Replacing Existing VisualMeasurementSheet

```tsx
// Before
<VisualMeasurementSheet
  measurements={measurements}
  onMeasurementChange={handleChange}
  windowType="standard"
  selectedTemplate={template}
  // ... other props
/>

// After
<EditableMeasurementVisual
  measurements={{
    ...measurements,
    window_type: "standard"
  }}
  treatmentData={{
    template: transformTemplate(template)
  }}
  onMeasurementChange={handleChange}
/>
```

### Using in Different Contexts

```tsx
// In a project preview page
<PreviewMeasurementVisual
  measurements={projectMeasurements}
  treatmentData={projectTreatment}
  projectData={projectInfo}
/>

// In a work order
<WorkOrderMeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
/>

// In a quote
<MeasurementVisual
  measurements={measurements}
  treatmentData={treatmentData}
  projectData={projectData}
  config={VISUAL_CONFIGS.QUOTE_DISPLAY}
/>
```

## Fabric Calculations

The system includes built-in fabric calculations that automatically compute:

- Linear meters required
- Total fabric cost
- Width requirements
- Manufacturing allowances
- Waste calculations

```tsx
const handleCalculationChange = (calculation: FabricCalculation | null) => {
  if (calculation) {
    console.log('Fabric required:', calculation.linearMeters);
    console.log('Total cost:', calculation.totalCost);
    console.log('Widths needed:', calculation.widthsRequired);
  }
};
```

## Project Data Integration

Use the `useProjectDataExtractor` hook to automatically extract project data from various sources:

```tsx
import { useProjectDataExtractor } from '@/components/shared/measurement-visual';

const projectData = useProjectDataExtractor({
  project: currentProject,
  client: projectClient,
  room: currentRoom,
  window: windowData
});
```

## Styling and Theming

The components use your existing design system and are fully themeable through CSS variables:

- Uses semantic color tokens (`container-level-1`, `container-level-2`)
- Responsive design with Tailwind CSS
- Consistent with your existing UI components
- Dark/light mode support

## Migration Guide

### From VisualMeasurementSheet

1. **Install the new system** (already created in your codebase)
2. **Transform your data structures**:
   ```tsx
   // Old
   const measurements = { rail_width: "200", drop: "250" };
   const windowType = "standard";
   
   // New
   const measurementData = { 
     ...measurements, 
     window_type: windowType 
   };
   ```

3. **Replace the component**:
   ```tsx
   // Old
   <VisualMeasurementSheet {...oldProps} />
   
   // New
   <EditableMeasurementVisual {...newProps} />
   ```

4. **Update event handlers** to use the new callback signatures

### Benefits of Migration

- **Consistency**: Same visual across all contexts
- **Maintainability**: Single source of truth for measurement visuals
- **Type Safety**: Full TypeScript support
- **Flexibility**: Easy to configure for different use cases
- **Performance**: Optimized rendering and calculations
- **Extensibility**: Easy to add new features and configurations

## Advanced Usage

### Custom Visual Configuration

```tsx
const customConfig = createVisualConfig({
  showMeasurementInputs: true,
  showFabricSelection: false,
  showCalculations: true,
  customTitle: "Technical Specifications",
  readOnly: true
});

<MeasurementVisual
  measurements={measurements}
  config={customConfig}
/>
```

### Context Provider for Global Project Data

```tsx
<ProjectDataProvider data={currentProject}>
  <MeasurementVisual measurements={measurements} />
  <AnotherComponent />
</ProjectDataProvider>
```

## File Structure

```
src/components/shared/measurement-visual/
├── index.ts                    # Main exports
├── types.ts                    # Type definitions
├── MeasurementVisual.tsx       # Main component
├── MeasurementVisualCore.tsx   # Core visual component
├── MeasurementInputs.tsx       # Input controls
├── TreatmentControls.tsx       # Treatment selection
├── CalculationDisplay.tsx      # Fabric calculations
├── ProjectInfoDisplay.tsx      # Project information
├── ProjectDataProvider.tsx     # Context provider
├── hooks/
│   └── useFabricCalculator.ts  # Calculation logic
└── examples/
    └── ExistingIntegration.tsx # Integration examples
```

This system provides a solid foundation for consistent measurement visuals throughout your application while maintaining flexibility for different use cases.
