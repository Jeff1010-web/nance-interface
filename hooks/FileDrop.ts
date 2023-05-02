import { markdownToHtml } from "../libs/markdown";
import { Editor } from "tinymce";

export const fileDrop = (editor: Editor) => {
    editor.on('drop', async function (e) {
      e.preventDefault(); // prevent default drop behavior
      const file = e.dataTransfer.items[0].getAsFile();
      if (file.name.endsWith('.md')) {      
        const md = await file.text();
        editor.setContent(await markdownToHtml(md))
      }
    });
  }
