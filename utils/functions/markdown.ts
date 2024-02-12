import { unified } from 'unified';
import remarkParse from 'remark-parse';

export function getParagraphOfMarkdown(raw: string, paragraphIndex: number = 0) {
  const parsed = unified().use(remarkParse).parse(raw);
  const texts: string[] = parsed.children
    .filter(c => c.type === "paragraph")
    //@ts-ignore
    .map(c => c.children[0])
    .filter(c => c.type === "text" && c.value.trim().length > 5)
    .map(c => c.value);

  const ret = texts[paragraphIndex] || "THE END";
  return ret;
}
