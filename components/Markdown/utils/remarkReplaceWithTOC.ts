// Modified from https://github.com/remarkjs/remark-toc/blob/9d0e2764ce3b5a8276e3cdee36c56ff6eecf7477/lib/index.js
// This plugin will generate TOC and remove other content.
import {toc, Options} from 'mdast-util-toc'

/**
 * Generate a table of contents (TOC).
 *
 * Looks for the first heading matching `options.heading` (case insensitive),
 * removes everything between it and an equal or higher next heading, and
 * replaces that with a list representing the rest of the document structure,
 * linking to all further headings.
 *
 * @param {Readonly<Options> | null | undefined} [options]
 *   Configuration (optional).
 * @returns
 *   Transform.
 */
export default function remarkReplaceWithToc(options: Readonly<Options> | null | undefined) {
  const settings = {
    ...options,
    heading: (options && options.heading) || '(table[ -]of[ -])?contents?|toc',
    tight: options && typeof options.tight === 'boolean' ? options.tight : true
  }

  /**
   * Transform.
   *
   * @param {Root} tree
   *   Tree.
   * @returns {undefined}
   *   Nothing.
   */
  return function (tree: any) {
    const result = toc(tree, settings)

    if (
      result.endIndex === undefined ||
      result.endIndex === -1 ||
      result.index === undefined ||
      result.index === -1 ||
      !result.map
    ) {
      return
    }

    tree.children = [
      //...tree.children.slice(0, result.index),
      result.map,
      //...tree.children.slice(result.endIndex)
    ]
  }
}
