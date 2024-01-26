import { Editor } from "@toast-ui/react-editor";
import { RefObject } from "react";
import { setMarkdown, insertLink } from "./editorModifier";
import { uploadBlob2IPFS } from "./uploadImage2IPFS";

export const drop2AttachMarkdown = (editor: RefObject<Editor>) => {
  const handleFileDrop = async (e: DragEvent) => {
    e.preventDefault();
    e.stopImmediatePropagation(); // was running multiple times for some reason

    // if md, set markdown
    const file = e.dataTransfer?.files[0];
    if (file && file.name.toLowerCase().endsWith(".md")) {
      const md = await file.text();
      setMarkdown(editor, md);
    }

    // if pdf, upload to ipfs and insert link
    if (file && file.name.toLowerCase().endsWith(".pdf")) {
      const fileName = file.name.split(".")[0];
      uploadBlob2IPFS(file).then((url) => insertLink(editor, url, fileName));
    }
  };
  window.addEventListener("drop", handleFileDrop);
};
