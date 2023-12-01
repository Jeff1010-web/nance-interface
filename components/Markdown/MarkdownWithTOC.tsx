import remarkGfm from "remark-gfm";
import remarkToc from "remark-toc";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import ReactMarkdown from "react-markdown";
import React from "react";
import { h } from "hastscript";

export default function MarkdownWithTOC({ body }: { body: string }) {
  return (
    <article className="prose md:prose-lg lg:prose-xl prose-indigo prose-table:table-fixed mx-auto break-words text-gray-500">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkToc]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
          [
            rehypeAutolinkHeadings,
            {
              content(node: any) {
                return [h("span.ml-2.hidden.group-hover:inline", "#")];
              },
              behavior: "append",
            },
          ],
        ]}
        components={{
          h2: ({ node, ...props }) => <h2 className="group" {...props} />,
          h3: ({ node, ...props }) => <h3 className="group" {...props} />,
          h4: ({ node, ...props }) => <h4 className="group" {...props} />,
          h5: ({ node, ...props }) => <h5 className="group" {...props} />,
          h6: ({ node, ...props }) => <h6 className="group" {...props} />,
        }}
      >
        {"## Table of contents \n\n ## Contents \n\n" + body}
      </ReactMarkdown>
    </article>
  );
}
