import ReactMarkdown from "react-markdown";
import React, { useContext } from "react";
import remarkReplaceWithToc from "../Markdown/utils/remarkReplaceWithTOC";
import { ProposalContext } from "./context/ProposalContext";

export default function ProposalTOC() {
  const { commonProps } = useContext(ProposalContext);

  return (
    <div className="mb-2 lg:block hidden">
      <p className="text-lg font-medium">Table of contents</p>
      <article className="text-gray-900 max-h-60 overflow-y-scroll prose-sm prose-ul:pl-1 prose-li:my-0 prose-ul:my-0">
        <ReactMarkdown
          remarkPlugins={[remarkReplaceWithToc]}
        >
          {"## Table of contents \n\n" + commonProps.body}
        </ReactMarkdown>
      </article>
    </div>
  );
}
