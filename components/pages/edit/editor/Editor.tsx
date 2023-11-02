import { RefObject } from 'react';
import { Editor } from '@toast-ui/react-editor';
import { imageUpload } from '../../../../utils/hooks/ImageUpload';
import '@nance/nance-editor/lib/editor.css';
import Loading from './LoadingBar';
import { handleDrop } from './helpers';

function TextEditor({ parentRef, onEditorChange, initialValue }: { parentRef: RefObject<Editor>, onEditorChange: (md: string) => void, initialValue: string }) {
  // setup loading bar
  const { Component: LoadingBar, setImageUploading, simulateLoading } = Loading();

  // setup .md file drag and drop
  handleDrop(parentRef);

  return (
    <div>
      <LoadingBar />
      <Editor
        ref={parentRef}
        initialValue={initialValue}
        previewStyle="tab"
        height="600px"
        initialEditType="wysiwyg"
        useCommandShortcut={true}
        onChange={() => {
          if (parentRef.current) onEditorChange(parentRef.current?.getInstance().getMarkdown() || initialValue);
        }}
        hooks={{
          addImageBlobHook(blob, cb) {
            const loading = simulateLoading(blob.size);
            imageUpload(blob).then((url) => {
              cb(url);
              clearInterval(loading);
              setImageUploading(0);
            });
          },
        }}
      />
    </div>
  );
}

export default TextEditor;
