import Link from "next/link";
import Image from "next/image";
import { SiteNav } from "@/components/Site";

export default function Custom500({ errMsg }: { errMsg?: string }) {
  const imageSrc = "https://http.cat/500";
  const errLabel =
    errMsg ||
    "Sorry, we can't present that page now due to some errors. You'll find lots to explore on the home page.";

  return (
    <>
      <SiteNav
        pageTitle="Internal Server Error"
        description={errLabel}
        image={imageSrc}
      />

      <section className="bg-grey-lightest dark:bg-gray-900">
        <div className="mx-auto max-w-screen-xl px-4 py-8 lg:px-6 lg:py-16">
          <div className="mx-auto max-w-screen-sm text-center">
            <Image src={imageSrc} alt="500" width={487} height={450} />
            <p className="my-4 text-lg font-light text-gray-500 dark:text-gray-400">
              {errLabel}
            </p>
            <div className="focus:ring-primary-300 dark:focus:ring-primary-900 my-4 mr-4 inline-block rounded-lg bg-gray-200 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-gray-300 focus:outline-none focus:ring-4">
              <Link href="/" legacyBehavior>
                <a>Back to home</a>
              </Link>
            </div>
            <div className="focus:ring-primary-300 dark:focus:ring-primary-900 my-4 inline-block rounded-lg bg-amber-200 px-5 py-2.5 text-center text-sm font-medium text-black hover:bg-amber-300 focus:outline-none focus:ring-4">
              <Link
                href="discord://discord.com/channels/1090064637858414633/1090064837498896395"
                legacyBehavior
              >
                <a>Contact us</a>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
