import { Editor } from '@toast-ui/react-editor';
import { RefObject } from 'react';

export const getMarkdown = (editorRef: RefObject<Editor>) => {
  return editorRef.current?.getInstance().getMarkdown();
};

export const setMarkdown = (editorRef: RefObject<Editor>, markdown: string) => {
  editorRef.current?.getInstance().setMarkdown(markdown, false);
};

export const handleDrop = (editor: RefObject<Editor>) => {
  const handleFileDrop = async (e: DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    if (file && file.name.endsWith('.md')) {
      const md = await file.text();
      setMarkdown(editor, md);
    }
  };
  window.addEventListener('drop', handleFileDrop);
};
