import { useFieldArray } from "react-hook-form";
import { useState } from "react";
import FormattedAddress from "../AddressCard/FormattedAddress";
import ENSAddressInput from "../form/ENSAddressInput";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

export default function SpaceOwnersForm({ edit = true }: { edit?: boolean; }) {
  const { fields, append, remove } = useFieldArray({
    name: "spaceOwners",
  });

  const spaceOwners = fields as { id: string, address: string }[]; // HACK: is there a better way to do this?

  const [addOwner, setAddOwner] = useState<string>(""); 

  const validateAddress = (address: string) => {
    const re = /^0x[a-fA-F0-9]{40}$/;
    if (spaceOwners.find((owner) => owner.address === address)) return false;
    return re.test(address);
  };

  return (
    <div className="flex flex-col">
      {edit && (
        <>
          <label className="mb-1 block text-sm font-medium text-gray-700">Add additional owners</label>
          <div className="flex flex-row mb-2 max-w-md">
            <ENSAddressInput
              val={addOwner}
              setVal={(v: string) => setAddOwner(v)}
            />

            {/* button to append address to form */}
            <button type="button" onClick={() => {
              append({ address: addOwner });
              setAddOwner("");
            }}
            disabled={!validateAddress(addOwner)}
            className="text-blue-600 disabled:text-gray-300"
            >
              <PlusCircleIcon className="ml-2 h-7 w-7" />
            </button>
          </div>
        </>
      )}

      {/* view addresses */}
      <div className="flex flex-col space-y-2 text-left">
        {spaceOwners.map((field, index) => (
          <div key={field.id}>
            <FormattedAddress
              address={field.address}
              action={index === 0 || !edit ? undefined : () => {
                remove(index);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
