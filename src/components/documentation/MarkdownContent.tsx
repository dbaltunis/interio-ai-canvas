import React from 'react';
import { SafeHTML } from '@/components/ui/SafeHTML';

interface MarkdownContentProps {
  content: string;
  className?: string;
}

/**
 * Converts basic markdown syntax to HTML for documentation display.
 * Handles: **bold**, *italic*, `code`, bullet lists, and line breaks.
 */
export const MarkdownContent: React.FC<MarkdownContentProps> = ({ content, className }) => {
  const parseMarkdown = (text: string): string => {
    let html = text;
    
    // Escape HTML entities first (except for our generated tags)
    html = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Code blocks with triple backticks (```code```)
    html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-black/40 rounded-md p-3 my-2 overflow-x-auto text-sm font-mono text-emerald-400">$1</pre>');
    
    // Inline code with single backticks (`code`)
    html = html.replace(/`([^`]+)`/g, '<code class="bg-black/40 px-1.5 py-0.5 rounded text-sm font-mono text-emerald-400">$1</code>');
    
    // Bold text (**text**)
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-white">$1</strong>');
    
    // Italic text (*text*) - must come after bold
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
    
    // Headers within content (lines starting with #)
    html = html.replace(/^### (.+)$/gm, '<h4 class="text-lg font-semibold text-white mt-4 mb-2">$1</h4>');
    html = html.replace(/^## (.+)$/gm, '<h3 class="text-xl font-semibold text-white mt-4 mb-2">$1</h3>');
    html = html.replace(/^# (.+)$/gm, '<h2 class="text-2xl font-bold text-white mt-4 mb-2">$1</h2>');
    
    // Bullet points (• or - at start of line)
    html = html.replace(/^[•\-] (.+)$/gm, '<li class="ml-4 list-disc">$1</li>');
    
    // Numbered lists (1. 2. etc)
    html = html.replace(/^\d+\. (.+)$/gm, '<li class="ml-4 list-decimal">$1</li>');
    
    // Wrap consecutive <li> elements in <ul> or <ol>
    html = html.replace(/(<li class="ml-4 list-disc">[^<]*<\/li>\n?)+/g, '<ul class="my-2 space-y-1 list-disc list-inside">$&</ul>');
    html = html.replace(/(<li class="ml-4 list-decimal">[^<]*<\/li>\n?)+/g, '<ol class="my-2 space-y-1 list-decimal list-inside">$&</ol>');
    
    // URLs that look like links (https://...)
    html = html.replace(
      /(https?:\/\/[^\s<]+)/g, 
      '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline break-all">$1</a>'
    );
    
    // Arrows (→, ↓) - style as accent
    html = html.replace(/→/g, '<span class="text-primary">→</span>');
    html = html.replace(/↓/g, '<span class="text-primary">↓</span>');
    
    // Line breaks - convert \n to <br /> for proper spacing
    html = html.replace(/\n/g, '<br />');
    
    return html;
  };

  const htmlContent = parseMarkdown(content);

  return (
    <SafeHTML 
      html={htmlContent} 
      className={`text-white/80 leading-relaxed text-base ${className || ''}`}
    />
  );
};

export default MarkdownContent;
