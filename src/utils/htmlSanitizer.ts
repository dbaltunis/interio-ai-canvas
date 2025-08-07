// HTML Sanitization utility to prevent XSS attacks
class HTMLSanitizer {
  private static allowedTags = [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'span', 'div',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 
    'a', 'img',
    'table', 'thead', 'tbody', 'tr', 'th', 'td'
  ];

  private static allowedAttributes: Record<string, string[]> = {
    'a': ['href', 'title', 'target'],
    'img': ['src', 'alt', 'width', 'height'],
    'span': ['style'],
    'div': ['style'],
    'p': ['style'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan']
  };

  private static allowedProtocols = ['http:', 'https:', 'mailto:'];

  private static sanitizeAttribute(tagName: string, attrName: string, attrValue: string): string | null {
    const allowedAttrs = this.allowedAttributes[tagName] || [];
    
    if (!allowedAttrs.includes(attrName)) {
      return null;
    }

    // Sanitize href attributes
    if (attrName === 'href') {
      try {
        const url = new URL(attrValue, window.location.origin);
        if (!this.allowedProtocols.includes(url.protocol)) {
          return null;
        }
        return url.toString();
      } catch {
        return null;
      }
    }

    // Sanitize src attributes
    if (attrName === 'src') {
      try {
        const url = new URL(attrValue, window.location.origin);
        if (!['http:', 'https:', 'data:'].includes(url.protocol)) {
          return null;
        }
        return url.toString();
      } catch {
        return null;
      }
    }

    // Sanitize style attributes (basic CSS sanitization)
    if (attrName === 'style') {
      return this.sanitizeStyle(attrValue);
    }

    // For other attributes, just remove potentially dangerous content
    return attrValue
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      .replace(/<script/gi, '')
      .replace(/<\/script>/gi, '');
  }

  private static sanitizeStyle(style: string): string {
    // Remove dangerous CSS properties and values
    return style
      .replace(/expression\s*\(/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/vbscript:/gi, '')
      .replace(/on\w+\s*:/gi, '')
      .replace(/@import/gi, '')
      .replace(/url\s*\(/gi, '')
      .trim();
  }

  static sanitize(html: string): string {
    // Create a temporary DOM element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Recursively sanitize all nodes
    this.sanitizeNode(tempDiv);

    return tempDiv.innerHTML;
  }

  private static sanitizeNode(node: Element): void {
    const children = Array.from(node.children);
    
    for (const child of children) {
      const tagName = child.tagName.toLowerCase();
      
      if (!this.allowedTags.includes(tagName)) {
        // Remove disallowed tags but keep their content
        const textContent = child.textContent || '';
        const textNode = document.createTextNode(textContent);
        child.parentNode?.replaceChild(textNode, child);
        continue;
      }

      // Sanitize attributes
      const attributes = Array.from(child.attributes);
      for (const attr of attributes) {
        const sanitized = this.sanitizeAttribute(tagName, attr.name, attr.value);
        if (sanitized === null) {
          child.removeAttribute(attr.name);
        } else {
          child.setAttribute(attr.name, sanitized);
        }
      }

      // Recursively sanitize child nodes
      this.sanitizeNode(child);
    }
  }
}

// Safe HTML rendering component props
export interface SafeHTMLProps {
  html: string;
  className?: string;
}

// Utility function for safe HTML rendering
export const sanitizeHTML = (html: string): string => {
  if (typeof window === 'undefined') {
    // Server-side: basic text extraction
    return html.replace(/<[^>]*>/g, '');
  }
  
  return HTMLSanitizer.sanitize(html);
};

// React component for safe HTML rendering
export const SafeHTML: React.FC<SafeHTMLProps> = ({ html, className }) => {
  const sanitizedHTML = sanitizeHTML(html);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedHTML }}
    />
  );
};

// Utility for safe text content extraction
export const extractTextContent = (html: string): string => {
  if (typeof window === 'undefined') {
    return html.replace(/<[^>]*>/g, '');
  }
  
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = sanitizeHTML(html);
  return tempDiv.textContent || tempDiv.innerText || '';
};
