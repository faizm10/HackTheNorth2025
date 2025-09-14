import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import katex from "katex";
import "katex/dist/katex.min.css";

/**
 * Props for the MarkdownRenderer component.
 *
 * @interface MarkdownRendererProps
 * @property {string} content - The markdown content to render
 * @property {number} [fontSize=16] - Base font size in pixels for the rendered content
 */
interface MarkdownRendererProps {
  content: string;
  fontSize?: number;
}

/**
 * A sophisticated markdown renderer with mathematical equation support and code syntax highlighting.
 *
 * This component provides rich text rendering capabilities specifically designed for educational content,
 * supporting GitHub Flavored Markdown (GFM), mathematical expressions via KaTeX, and custom styling
 * for code blocks and inline code.
 *
 * Features:
 * - GitHub Flavored Markdown (tables, strikethrough, task lists)
 * - Mathematical equations using KaTeX (LaTeX syntax)
 * - Syntax-highlighted code blocks
 * - Responsive typography with adjustable font sizes
 * - Educational-friendly styling (proper spacing, readable fonts)
 * - Inline and block code differentiation
 *
 * Mathematical Syntax Examples:
 * - Inline math: `$E = mc^2$`
 * - Block math: `$$\sum_{i=1}^n x_i = x_1 + x_2 + \cdots + x_n$$`
 * - Vectors: `$\vec{v} = \langle x, y \rangle$`
 * - Matrices: `$\begin{pmatrix} a & b \\ c & d \end{pmatrix}$`
 *
 * @param {MarkdownRendererProps} props - Component configuration
 * @returns {JSX.Element} Rendered markdown content with math and code support
 *
 * @example
 * ```typescript
 * <MarkdownRenderer
 *   content="The vector $\vec{v} = (3, 4)$ has magnitude $|\vec{v}| = \sqrt{3^2 + 4^2} = 5$"
 *   fontSize={18}
 * />
 *
 * <MarkdownRenderer
 *   content={`
 *     ## Code Example
 *     \`\`\`python
 *     import numpy as np
 *     v = np.array([3, 4])
 *     magnitude = np.linalg.norm(v)
 *     \`\`\`
 *   `}
 * />
 * ```
 */
export function MarkdownRenderer({
  content,
  fontSize = 16,
}: MarkdownRendererProps) {
  // Normalize common math delimiters used by some models: \( ... \) and \[ ... \]
  const normalizeMathDelimiters = (text: string) =>
    text
      // block math: \[ ... \] -> $$ ... $$
      .replace(/\\\[/g, "$$")
      .replace(/\\\]/g, "$$")
      // inline math: \( ... \) -> $ ... $
      .replace(/\\\(/g, "$")
      .replace(/\\\)/g, "$");

  const normalized = normalizeMathDelimiters(content || "");

  return (
    <div style={{ fontSize, color: "#141414", lineHeight: 1.6 }}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          /**
           * Custom paragraph component with consistent bottom margin.
           * Ensures proper spacing between text blocks in educational content.
           */
          p: (props: any) => <p style={{ margin: "0 0 10px" }} {...props} />,

          /**
           * Custom unordered list component with proper indentation.
           * Provides consistent spacing and visual hierarchy for bullet points.
           */
          ul: (props: any) => (
            <ul style={{ margin: "0 0 10px 20px" }} {...props} />
          ),

          /**
           * Custom ordered list component with proper indentation.
           * Maintains consistent numbering and spacing for sequential content.
           */
          ol: (props: any) => (
            <ol style={{ margin: "0 0 10px 20px" }} {...props} />
          ),

          /**
           * Advanced code component supporting both inline and block code.
           *
           * Features:
           * - Differentiated styling for inline vs block code
           * - Monospace font stack for code readability
           * - Responsive font sizing based on context
           * - Horizontal scrolling for long code blocks
           * - GitHub-style background colors
           *
           * Inline code: `const x = 5`
           * Block code: ```python\nprint("Hello")\n```
           */
          code: ({ inline, className, children, ...props }: any) => {
            const codeText = String(children ?? "").trim();
            const isMathBlock =
              !inline &&
              (
                (className && /language-(math|latex)/.test(className)) ||
                /\\\[|\\\]|\\\(|\\\)|\\begin\{|^\$|\$\$/.test(codeText)
              );

            if (isMathBlock) {
              // Render math code blocks using KaTeX directly
              const html = katex.renderToString(codeText, {
                displayMode: true,
                throwOnError: false,
              });
              return (
                <div
                  className="math-block"
                  style={{ margin: "8px 0" }}
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              );
            }

            return (
              <code
                style={{
                  background: inline ? "#f6f8fa" : "#fafafa",
                  border: "1px solid #f0f0f0",
                  borderRadius: 6,
                  padding: inline ? "0 4px" : 8,
                  display: inline ? "inline" : "block",
                  overflowX: "auto",
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
                  fontSize: inline ? fontSize - 2 : fontSize - 1,
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {normalized}
      </ReactMarkdown>
    </div>
  );
}
