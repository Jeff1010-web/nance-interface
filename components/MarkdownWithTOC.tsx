import remarkGfm from 'remark-gfm';
import remarkToc from 'remark-toc';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import ReactMarkdown from 'react-markdown';
import React from 'react';
import {h} from 'hastscript'

export default function MarkdownWithTOC({ body }: { body: string }) {
    return (
        <article className="prose prose-lg prose-indigo mx-auto text-gray-500 break-words">
            <ReactMarkdown remarkPlugins={[remarkGfm, remarkToc]} 
                rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeSlug, 
                    [rehypeAutolinkHeadings, {
                        content(node) {
                            return [
                              h('span.mr-1', '#')
                            ]
                        } 
                    }]]}>
                {"## Table of contents \n" + body}
            </ReactMarkdown>
        </article>
    )
}