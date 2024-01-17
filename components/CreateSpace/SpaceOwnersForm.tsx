import { useFieldArray } from "react-hook-form";
import { useEffect, useState } from "react";
import FormattedAddress from "../AddressCard/FormattedAddress";
import ENSAddressInput from "../form/ENSAddressInput";
import { PlusCircleIcon } from "@heroicons/react/24/solid";

const validateAddress = (address: string) => {
  const re = /^0x[a-fA-F0-9]{40}$/;
  return re.test(address);
};

export default function SpaceOwnersForm({ edit = true, currentSpaceOwners }: { edit?: boolean; currentSpaceOwners: string[] }) {
  const { fields, append, remove } = useFieldArray({
    name: "spaceOwners",
  });

  const spaceOwners = fields as { id: string, address: string }[]; // is there a better way to do this?

  const [addOwner, setAddOwner] = useState<string>(""); 

  useEffect(() => {
    // Add currentSpaceOwners to form viewer if they exist
    if (currentSpaceOwners.length > 0
      && currentSpaceOwners[0] !== ""
      && spaceOwners.length === 0
    ) {
      currentSpaceOwners.forEach((address) => {
        append({ address });
      });
    }
  }, [currentSpaceOwners, spaceOwners]);

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
              subText={index === 0 ? "You must be an owner" : undefined }
              action={index === 0 || !edit ? undefined : () => {
                console.log(index, field);
                remove(index);
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
