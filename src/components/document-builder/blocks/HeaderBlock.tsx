import { DocumentBlock } from '../DocumentBuilderTab';

interface HeaderBlockProps {
  block: DocumentBlock;
}

export const HeaderBlock = ({ block }: HeaderBlockProps) => {
  const { content = {}, styles = {} } = block;
  
  return (
    <div style={styles} className="space-y-2">
      <h1 className="text-3xl font-bold text-gray-900">
        {content.companyName || 'Your Company Name'}
      </h1>
      {content.tagline && (
        <p className="text-sm text-gray-600 italic">{content.tagline}</p>
      )}
      <div className="text-sm text-gray-600 space-y-1">
        {content.address && <p>{content.address}</p>}
        {content.phone && <p>Phone: {content.phone}</p>}
        {content.email && <p>Email: {content.email}</p>}
        {content.website && <p>Website: {content.website}</p>}
      </div>
    </div>
  );
};
