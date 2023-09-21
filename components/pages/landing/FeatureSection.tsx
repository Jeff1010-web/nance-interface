import Image from "next/image";
import { ArrowPathIcon, DocumentMagnifyingGlassIcon, WrenchScrewdriverIcon } from '@heroicons/react/24/solid'

const features = [
  {
    name: 'Cyclical governance agent.',
    description:
      "It's a Discord-based cyclical governance agent that informs community members about governance phases, manages proposal discussions, and sends alerts for participation, execution, and ongoing payments.",
    icon: ArrowPathIcon,
  },
  {
    name: 'Proposal creator and viewer.',
    description: "It offers a user-friendly platform for creating and viewing proposals with features like a clean editor, IPFS image pinning, transparent and forkable storage, onchain action attachment, and comprehensive tracking of proposal progress.",
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: 'Execution tool.',
    description: "It serves as a tool for facilitating the execution of proposal actions, including project reconfiguration, token transfers, and integration with community safes for easy comparison with previous cycles.",
    icon: WrenchScrewdriverIcon,
  },
]

export default function FeatureSection() {
  return (
    <div className="overflow-hidden bg-gray py-24 sm:py-32" id="feature-section">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 sm:gap-y-20 lg:mx-0 lg:max-w-none lg:grid-cols-2">
          <div className="lg:pr-8 lg:pt-4">
            <div className="lg:max-w-lg">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">Govern easier</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">A better workflow</p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Nance is a comprehensive platform for managing and facilitating community governance, featuring proposal creation, execution assistance, and transparent tracking of proposal progress.
              </p>
              <dl className="mt-10 max-w-xl space-y-8 text-base leading-7 text-gray-600 lg:max-w-none">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-9">
                    <dt className="inline font-semibold text-gray-900">
                      <feature.icon className="absolute left-1 top-1 h-5 w-5 text-indigo-600" aria-hidden="true" />
                      {feature.name}
                    </dt>{' '}
                    <dd className="inline">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
          <Image
            src="/images/homepage/app-screenshot.png"
            alt="Product screenshot"
            className="w-[48rem] max-w-none rounded-xl shadow-xl ring-1 ring-gray-400/10 sm:w-[57rem] md:-ml-4 lg:-ml-0"
            width={2432}
            height={1442}
          />
        </div>
      </div>
    </div>
  )
}
