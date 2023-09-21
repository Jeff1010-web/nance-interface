import Image from "next/image";

export default function Testimonials() {
  return (
    <section className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="flex flex-col pb-10 sm:pb-16 lg:pb-0 lg:pr-8 xl:pr-20">
            <img className="h-12 self-start" src="/images/homepage/juice-logo-full.svg" alt="Logo of Juicebox protocol" />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg leading-8 text-gray-900">
                <p>
                  “I&apos;m a fan of Governor to replace the multisig problem, and a fan of Nance to coordinate independent parties towards a shared single reconfiguration specification.”
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <Image
                  className="rounded-full bg-gray-50"
                  src="https://cdn.stamp.fyi/avatar/0x823b92d6a4b2AED4b15675c7917c9f922ea8ADAD"
                  alt=""
                  width={56}
                  height={56}
                />
                <div className="text-base">
                  <div className="font-semibold text-gray-900">jango</div>
                  <div className="mt-1 text-gray-500">Founder of Juicebox</div>
                </div>
              </figcaption>
            </figure>
          </div>
          <div className="flex flex-col border-t border-gray-900/10 pt-10 sm:pt-16 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0 xl:pl-20">
            <Image className="self-start" height={48} width={48} src="/images/homepage/peel.png" alt="Logo of PeelDAO" />
            <figure className="mt-10 flex flex-auto flex-col justify-between">
              <blockquote className="text-lg leading-8 text-gray-900">
                <p>
                  “This VotesBar is most clutch nance feature. so simple, so beautiful”
                </p>
              </blockquote>
              <figcaption className="mt-10 flex items-center gap-x-6">
                <Image
                  className="rounded-full bg-gray-50"
                  src="https://cdn.stamp.fyi/avatar/0xE16a238d207B9ac8B419C7A866b0De013c73357B"
                  alt=""
                  width={56}
                  height={56}
                />
                <div className="text-base">
                  <div className="font-semibold text-gray-900">aeolian</div>
                  <div className="mt-1 text-gray-500">Dev of PeelDAO</div>
                </div>
              </figcaption>
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
