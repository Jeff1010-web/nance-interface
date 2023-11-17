import AddressForm from "../form/AddressForm";

export default function GGGTransferActionForm({
  genFieldName,
}: {
  genFieldName: (field: string) => any;
}) {
  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Receiver" fieldName={genFieldName("to")} />
      </div>

      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="NFT Contract Address" fieldName={genFieldName("contract")} defaultValue="0x8250e3cE89c8C380449de876882F5EDAA6EF44c7"/>
      </div>
    </div>
  );
}
