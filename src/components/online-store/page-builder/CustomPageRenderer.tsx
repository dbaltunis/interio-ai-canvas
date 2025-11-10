import { PagePreview } from "./PagePreview";

interface CustomPageRendererProps {
  pageStructure: any[];
}

export const CustomPageRenderer = ({ pageStructure }: CustomPageRendererProps) => {
  if (!pageStructure || pageStructure.length === 0) {
    return null;
  }

  return <PagePreview sections={pageStructure} />;
};
