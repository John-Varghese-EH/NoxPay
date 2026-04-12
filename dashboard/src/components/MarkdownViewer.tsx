"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import mermaid from "mermaid";

export default function MarkdownViewer({ content }: { content: string }) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    mermaid.initialize({ startOnLoad: false, theme: "dark" });
    if (contentRef.current) {
      mermaid.run({
        nodes: contentRef.current.querySelectorAll('.language-mermaid')
      }).catch(e => console.error(e));
    }
  }, [content]);

  return (
    <div ref={contentRef} className="prose prose-invert prose-violet max-w-none hover:prose-a:text-violet-300 prose-img:rounded-xl">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          code({ className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";
            if (isMermaid) {
              return (
                <div className="language-mermaid">
                  {String(children).replace(/\n$/, "")}
                </div>
              );
            }
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
