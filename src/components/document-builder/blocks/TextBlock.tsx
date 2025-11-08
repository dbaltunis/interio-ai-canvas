import { DocumentBlock } from '../DocumentBuilderTab';

interface TextBlockProps {
  block: DocumentBlock;
}

export const TextBlock = ({ block }: TextBlockProps) => {
  const { content = {}, styles = {} } = block;
  
  return (
    <div style={styles}>
      {content.heading && (
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {content.heading}
        </h3>
      )}
      <p className="text-gray-700 whitespace-pre-wrap">
        {content.text || 'Enter your text here...'}
      </p>
    </div>
  );
};
