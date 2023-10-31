import { unified } from 'unified';
import remarkParse from 'remark-parse';

export function getFirstParagraphOfMarkdown(raw: string) {
  const parsed = unified().use(remarkParse).parse(raw);
  const texts: string[] = parsed.children
    .filter(c => c.type === "paragraph")
    //@ts-ignore
    .map(c => c.children[0])
    .filter(c => c.type === "text" && c.value.trim().length > 5)
    .map(c => c.value);

  const ret = texts[0] || raw;
  return ret.slice(0, 200);
}
