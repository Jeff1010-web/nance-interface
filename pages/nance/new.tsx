import { useState } from "react"
import SiteNav from "../../components/SiteNav"

export default function NanceNewProposal() {
  return (
    <>
      <SiteNav pageTitle="Nance" currentIndex={0} description="nan'ce." image="/images/lucky_demo.png" />
      <div className="m-4 lg:m-6 flex flex-col max-w-7xl justify-center">
        <p className="text-center text-xl font-bold text-gray-600 mb-6">
          New Proposal
        </p>
        <Form />
      </div>
    </>
  )
}

function PayoutMetadataForm() {
  return (
    <div className="grid grid-cols-3 gap-6">
      <div className="col-span-3 sm:col-span-1">
        <label htmlFor="project-version" className="block text-sm font-medium text-gray-700">
          Project Version
        </label>
        <select
          id="project-version"
          name="project-version"
          defaultValue={2}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option value={1}>V1 / V1.1</option>
          <option value={2}>V2</option>
        </select>
      </div>
      <div className="col-span-3 sm:col-span-2">
        <label htmlFor="payer" className="block text-sm font-medium text-gray-700">
          Project ID
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="payer"
            id="payer"
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="juicebox"
          />
        </div>
      </div>

      <div className="col-span-3 sm:col-span-1">
        <label htmlFor="receiver-type" className="block text-sm font-medium text-gray-700">
          Receiver Type
        </label>
        <select
          id="receiver-type"
          name="receiver-type"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
        >
          <option>Address</option>
          <option>Project</option>
        </select>
      </div>
      <div className="col-span-3 sm:col-span-2">
        <label htmlFor="receiver-value" className="block text-sm font-medium text-gray-700">
          Receiver
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="text"
            name="receiver-value"
            id="receiver-value"
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="twodam.eth"
          />
        </div>
      </div>

      <div className="col-span-3 sm:col-span-2">
        <label htmlFor="company-website" className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">
            $
          </span>
          <input
            type="number"
            step={1}
            min={1}
            name="proposal-amount"
            id="proposal-amount"
            className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1500"
          />
        </div>
      </div>

      <div className="col-span-3 sm:col-span-2">
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration
        </label>
        <div className="mt-1 flex rounded-md shadow-sm">
          <input
            type="number"
            step={1}
            min={1}
            name="duration"
            id="duration"
            className="block w-full flex-1 rounded-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            placeholder="1"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">For how many funding cycles?</p>
      </div>
    </div>
  )
}

type ProposalType =
  "trial-payout" | "onetime-payout" | "recurring-payout" |
  "reconfiguration" | "reserve-token-allocation" | "protocol-upgrade" |
  "processs-upgrade" | "update-multisig-member"

function Form() {
  const [proposalType, setProposalType] = useState<ProposalType>("trial-payout");

  return (
    <form className="space-y-6" action="#" method="POST">
      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Metadata</h3>
            <p className="mt-1 text-sm text-gray-500">
              This information will be used by Nance to automate governance.
            </p>
          </div>
          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-3 sm:col-span-3">
                <label htmlFor="proposal-type" className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  id="proposal-type"
                  name="proposal-type"
                  value={proposalType}
                  onChange={e => setProposalType(e.target.value as ProposalType)}
                  className="mt-1 block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
                >
                  <option value='trial-payout'>Trial Payout</option>
                  <option value='onetime-payout'>One-time Payout</option>
                  <option value='recurring-payout'>Recurring Payout</option>
                  <option value='reconfiguration'>Funding Cycle Reconfiguration</option>
                  <option value='reserve-token-allocation'>Reserve Token Allocation</option>
                  <option value='protocol-upgrade'>Protocol Upgrades</option>
                  <option value='processs-upgrade'>Process Upgrades</option>
                  <option value='update-multisig-member'>Update Multisig Member</option>
                </select>
              </div>
            </div>

            <PayoutMetadataForm />
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Proposal</h3>
            <p className="mt-1 text-sm text-gray-500">Detailed content of your proposal.</p>
          </div>
          <div className="mt-5 md:col-span-2 md:mt-0">
            <div className="grid grid-cols-6 gap-6">
              <div className="col-span-6 sm:col-span-3">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="about" className="mt-6 block text-sm font-medium text-gray-700">
                Body
              </label>
              <div className="mt-1">
                <textarea
                  id="about"
                  name="about"
                  rows={20}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  placeholder="you@example.com"
                  defaultValue={PORPOSAL_TEMPLATE}
                />
              </div>
              {/* <p className="mt-2 text-sm text-gray-500">Brief description for your profile. URLs are hyperlinked.</p> */}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">Notifications</h3>
            <p className="mt-1 text-sm text-gray-500">Decide which communications you'd like to receive and how.</p>
          </div>
          <div className="mt-5 space-y-6 md:col-span-2 md:mt-0">
            <fieldset>
              <legend className="sr-only">By Email</legend>
              <div className="text-base font-medium text-gray-900" aria-hidden="true">
                By Discord
              </div>
              <div className="mt-4 space-y-4">
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="comments"
                      name="comments"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="comments" className="font-medium text-gray-700">
                      Expiry
                    </label>
                    <p className="text-gray-500">Get notified when your proposal expires.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="candidates"
                      name="candidates"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="candidates" className="font-medium text-gray-700">
                      Execution
                    </label>
                    <p className="text-gray-500">Get notified when your proposal gets executed.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="flex h-5 items-center">
                    <input
                      id="offers"
                      name="offers"
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="offers" className="font-medium text-gray-700">
                      Progress
                    </label>
                    <p className="text-gray-500">Get notified when your proposal moves to new stage (temperature check & snapshot voting).</p>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="ml-3 inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Save
        </button>
      </div>
    </form>
  )
}

const PORPOSAL_TEMPLATE = `# Proposal Template

Status: Draft

\`\`\`
Author:
Date: (YYYY-MM-DD)
\`\`\`

## Synopsis

*State what the proposal does in one sentence.*

## Motivation

*What problem does this solve? Why now?* 

## Specification

*How exactly will this be executed? Be specific and leave no ambiguity.* 

## Rationale

*Why is this specification appropriate?*

## Risks

*What might go wrong?*

## Timeline

*When exactly should this proposal take effect? When exactly should this proposal end?*`