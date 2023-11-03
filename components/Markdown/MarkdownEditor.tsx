import { RefObject } from "react";
import { Editor } from "@toast-ui/react-editor";
import "@nance/nance-editor/lib/editor.css";
import Loading from "./sub/LoadingBar";
import { drop2AttachMarkdown, uploadImage2IPFS } from "./utils";

export default function MarkdownEditor({
  parentRef,
  onEditorChange,
  initialValue,
}: {
  parentRef: RefObject<Editor>;
  onEditorChange: (md: string) => void;
  initialValue: string;
}) {
  // setup loading bar
  const {
    Component: LoadingBar,
    setImageUploading,
    simulateLoading,
  } = Loading();

  drop2AttachMarkdown(parentRef);

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
          if (parentRef.current)
            onEditorChange(
              parentRef.current?.getInstance().getMarkdown() || initialValue,
            );
        }}
        hooks={{
          addImageBlobHook(blob, cb) {
            const loading = simulateLoading(blob.size);
            uploadImage2IPFS(blob).then((url) => {
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
