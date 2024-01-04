import TextForm from "./TextForm";

export default function RulesForm({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  return (
    <div className="flex flex-col md:flex-row md:space-x-6">
      <TextForm
        label="Nance space name"
        name="config.name"
        disabled={disabled}
      />
      <TextForm
        label="Proposal ID Prefix"
        name="config.proposalIdPrefix"
        disabled={disabled}
        maxLength={3}
        placeHolder="JBP"
        className="w-16"
        tooltip="Text prepended to proposal ID numbers, usually 3 letters representing your organization"
      />
    </div>
  );
}
