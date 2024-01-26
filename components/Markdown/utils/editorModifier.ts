import { Editor } from "@toast-ui/react-editor";
import { RefObject } from "react";

export const getMarkdown = (editorRef: RefObject<Editor>) => {
  return editorRef.current?.getInstance().getMarkdown();
};

export const setMarkdown = (editorRef: RefObject<Editor>, markdown: string) => {
  editorRef.current?.getInstance().setMarkdown(markdown, false);
};

export const insertLink = (editorRef: RefObject<Editor>, url: string, text: string) => {
  editorRef.current?.getInstance().exec("addLink", {
    linkUrl: url,
    linkText: text,
  });
};
