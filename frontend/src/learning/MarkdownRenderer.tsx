import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import 'katex/dist/katex.min.css'

export function MarkdownRenderer({ content, fontSize = 16 }: { content: string; fontSize?: number }) {
  return (
    <div style={{ fontSize, color: '#141414', lineHeight: 1.6 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: (props: any) => <p style={{ margin: '0 0 10px' }} {...props} />,
          ul: (props: any) => <ul style={{ margin: '0 0 10px 20px' }} {...props} />,
          ol: (props: any) => <ol style={{ margin: '0 0 10px 20px' }} {...props} />,
          code: ({ inline, children, ...props }: any) => (
            <code
              style={{
                background: inline ? '#f6f8fa' : '#fafafa',
                border: '1px solid #f0f0f0',
                borderRadius: 6,
                padding: inline ? '0 4px' : 8,
                display: inline ? 'inline' : 'block',
                overflowX: 'auto',
                fontFamily: 'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                fontSize: inline ? fontSize - 2 : fontSize - 1,
              }}
              {...props}
            >
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
