import { Disclosure } from '@headlessui/react';
import { MinusSmallIcon, PlusSmallIcon } from '@heroicons/react/24/outline';
import { ProposalContext } from "./context/ProposalContext";
import { useContext } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";

export default function ProposalSummaries() {
  const { proposalSummary, threadSummary } = useContext(ProposalContext);
  if (!proposalSummary && !threadSummary) return null;
  return (
    <div className="rounded-md border bg-gray-100">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl divide-y divide-gray-900/10">
          <dl className="mb-5 space-y-6 divide-y divide-gray-900/10">
            {proposalSummary && (
              <Summary type="Proposal" markdown={proposalSummary} />
            )}
            {threadSummary && (
              <Summary type="Discussion" markdown={threadSummary} />
            )}
          </dl>
        </div>
      </div>
    </div>
  );
}

const Summary = ({ type, markdown }: { type:string; markdown: string }) => {
  return (
    <Disclosure as="div" className="pt-6">
      {({ open }) => (
        <>
          <dt>
            <Disclosure.Button className="flex w-full items-start justify-between text-left text-gray-900">
              <span className="text-base font-semibold leading-7">{`${type} Summary `}</span>
              <span className="ml-6 flex h-7 items-center">
                {open ? (
                  <MinusSmallIcon className="h-6 w-6" aria-hidden="true" />
                ) : (
                  <PlusSmallIcon className="h-6 w-6" aria-hidden="true" />
                )}
              </span>
            </Disclosure.Button>
          </dt>
          <Disclosure.Panel as="dd" className="mt-2 pr-12">
            <article className="prose mx-auto break-words text-gray-500">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[
                  rehypeRaw,
                  rehypeSanitize,
                  rehypeSlug,
                ]}
              >
                {markdown.replace(/^#/gm, "###")}
              </ReactMarkdown>
            </article>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  );
};
