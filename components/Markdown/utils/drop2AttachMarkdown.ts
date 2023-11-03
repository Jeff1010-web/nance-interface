import { Editor } from "@toast-ui/react-editor";
import { RefObject } from "react";
import { setMarkdown } from "./editorModifier";

export const drop2AttachMarkdown = (editor: RefObject<Editor>) => {
  const handleFileDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith(".md")) {
      const md = await file.text();
      setMarkdown(editor, md);
    }
  };
  window.addEventListener("drop", handleFileDrop);
};
