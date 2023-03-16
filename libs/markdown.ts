import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeParse from 'rehype-parse'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import rehypeRemark from 'rehype-remark'
import remarkStringify from 'remark-stringify'
import { toHtml } from 'hast-util-to-html'

export async function htmlToMarkdown(raw: string, failSilently: boolean = false) {
  let ret: string = raw
  try {
    const converted = (await unified()
      .use(rehypeParse) // Parse HTML to a syntax tree
      .use(rehypeRemark, {
        handlers: {
          svg(h, node) {
            return h(node, 'html', toHtml(node))
          },
          pre(h, node) {
            return h(node, 'html', toHtml(node))
          },
          code(h, node) {
            return h(node, 'html', toHtml(node))
          },
          span(h, node) {
            return h(node, 'html', toHtml(node))
          },
        }
      }) // Turn HTML syntax tree to markdown syntax tree
      .use(remarkGfm)
      .use(remarkStringify) // Serialize HTML syntax tree
      .process(raw)).toString()
    console.debug('📚htmlToMarkdown', { raw, converted, failSilently })
    if (converted || failSilently) return converted
  } catch (error) {
    if (!failSilently) {
      throw error
    }
  }

  return ret
}

export async function markdownToHtml(raw: string, failSilently: boolean = false) {
  let ret: string = raw
  try {
    const converted = (await unified()
      .use(remarkParse) // Parse markdown content to a syntax tree
      .use(remarkGfm)
      .use(remarkRehype, { allowDangerousHtml: true }) // Turn markdown syntax tree to HTML syntax tree
      .use(rehypeSanitize) // Serialize HTML syntax tree
      .use(rehypeStringify)
      .process(raw)).toString()
    console.debug('📚markdownToHtml', { raw, converted, failSilently })
    if (converted || failSilently) return converted
  } catch (error) {
    if (!failSilently) {
      throw error
    }
  }

  return ret
}
