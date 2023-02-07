import SiteNav from "../components/SiteNav";
import ReactMarkdown from "react-markdown";
import Link from "next/link";
import remarkGfm from 'remark-gfm';


export async function getStaticProps(context) {
    // fetch markdown from git raw
    const res = await fetch("https://raw.githubusercontent.com/jbx-protocol/juice-docs/main/docs/dao/proposals.md");
    const markdown = await res.text();

    return {
      props: {
        markdown,
      }, // will be passed to the page component as props
    }
}

export default function ProcessPage({ markdown }) {

    return (
        <>
            <SiteNav pageTitle={"Governance Process"} description="Governance Process of JuiceboxDAO" image="/images/unsplash_voting.jpeg" />

            <div className="min-h-full flex justify-center">
                <main className="py-10">
                    <article className="prose prose-lg prose-indigo mx-auto mt-6 text-gray-500 break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>{markdown}</ReactMarkdown>
                    </article>
                </main>
            </div>
        </>
    )
}