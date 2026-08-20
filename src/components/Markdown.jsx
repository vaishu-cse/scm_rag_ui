import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import CodeBlock from './CodeBlock';

const components = {
  pre: CodeBlock,

  code({ className, children, ...rest }) {
    // Fenced blocks arrive carrying a language class and are already wrapped in a <pre>,
    // so only the bare ones get the inline treatment.
    if (className?.includes('language-')) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded-[5px] bg-bubble px-1.5 py-0.5 font-mono text-[0.85em]">
        {children}
      </code>
    );
  },

  a({ children, ...rest }) {
    return (
      <a {...rest} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto">
        <table>{children}</table>
      </div>
    );
  },
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[[rehypeHighlight, { detect: true, ignoreMissing: true }]]}
      components={components}
    >
      {children}
    </ReactMarkdown>
  );
}
