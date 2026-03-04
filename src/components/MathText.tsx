import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface MathTextProps {
  text: string;
  className?: string;
  block?: boolean;
}

export function MathText({ text, className = '', block = false }: MathTextProps) {
  // Clean up common raw symbol issues that make text unreadable
  let cleanText = text;
  
  // Fix orphaned backslash-commands outside of $ delimiters (e.g. \frac, \sin)
  // Only fix if not already inside $ delimiters
  cleanText = cleanText.replace(/(?<!\$)\\(frac|sqrt|sin|cos|tan|theta|pi|alpha|beta|gamma|delta|circ|angle|int|sum|prod|lim|infty|times|div|pm|leq|geq|neq|approx|equiv|cdot)(?!\$)/g, (match) => {
    return `$${match}$`;
  });

  // Split text by LaTeX delimiters
  const parts = cleanText.split(/(\$\$[^$]+\$\$|\$[^$]+\$)/g);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Block math ($$...$$)
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          try {
            return <BlockMath key={index} math={math} />;
          } catch {
            return <span key={index}>{math}</span>;
          }
        }
        
        // Inline math ($...$)
        if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
          const math = part.slice(1, -1);
          try {
            return <InlineMath key={index} math={math} />;
          } catch {
            return <span key={index}>{math}</span>;
          }
        }
        
        // Regular text
        return <span key={index}>{part}</span>;
      })}
    </span>
  );
}
