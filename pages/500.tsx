import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/Site";
import { BrowserClient, Feedback, getCurrentHub } from "@sentry/react";

const ERROR_TEMPLATE =
  "Sorry, we can't present that page now due to some errors. You'll find lots to explore on the home page.";

export default function Custom500({ errMsg }: { errMsg?: string }) {
  const client = getCurrentHub().getClient<BrowserClient>();
  const feedback = client?.getIntegration(Feedback);
  const imageSrc = "https://http.cat/500";

  return (
    <>
      <SiteNav
        pageTitle="Internal Server Error"
        description={ERROR_TEMPLATE}
        image={imageSrc}
      />

      <section className="bg-grey-lightest dark:bg-gray-900">
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
          <div className="mx-auto max-w-screen-sm text-center">
            <div className="flex justify-center">
              <Image src={imageSrc} alt="500" width={487} height={450} />
            </div>
            <p className="mt-4 text-lg font-light text-gray-500 dark:text-gray-400">
              {ERROR_TEMPLATE}
            </p>
            <p className="text-xs font-light text-gray-500 dark:text-gray-400">
              (errMsg: {errMsg})
            </p>
            <div className="focus:ring-primary-300 dark:focus:ring-primary-900 my-4 mr-4 inline-block rounded-lg bg-gray-200 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray-300 focus:outline-none focus:ring-4">
              <Link href="/" legacyBehavior>
                <a>Back to home</a>
              </Link>
            </div>
            <div className="focus:ring-primary-300 dark:focus:ring-primary-900 my-4 inline-block rounded-lg bg-amber-200 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-amber-300 focus:outline-none focus:ring-4">
              <button type="button" onClick={() => feedback?.openDialog()}>
                Report a bug
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
