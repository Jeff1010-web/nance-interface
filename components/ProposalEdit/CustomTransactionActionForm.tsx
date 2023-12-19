import { ErrorMessage } from "@hookform/error-message";
import { FunctionFragment, FormatTypes } from "ethers/lib/utils";
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import {
  TenderlySimulationAPIResponse,
  encodeTransactionInput,
} from "@/utils/hooks/TenderlyHooks";
import FunctionSelector from "./FunctionSelector";
import TenderlySimulationButton from "@/components/TenderlySimulation/TenderlySimulationButton";
import AddressForm from "../form/AddressForm";
import UIntForm from "../form/UIntForm";
import StringForm from "../form/StringForm";
import BooleanForm from "../form/BooleanForm";

export default function CustomTransactionActionForm({
  genFieldName,
  projectOwner,
}: {
  genFieldName: (field: string) => any;
  projectOwner: string | undefined;
}) {
  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();
  const [shouldSimulate, setShouldSimulate] = useState<boolean>();

  const {
    watch,
    control,
    formState: { errors },
    getValues,
    getFieldState,
    setValue,
  } = useFormContext();
  const { replace } = useFieldArray<{
    args: any[];
    [key: string]: any;
  }>({ name: genFieldName("args") });

  const args = functionFragment?.inputs?.map((param, index) =>
    getValues(genFieldName(`args.${index}`)),
  );
  const input = encodeTransactionInput(
    functionFragment?.format(FormatTypes.minimal) || "",
    args || [],
  );
  const simulateArgs = {
    from: projectOwner || "",
    to: getValues(genFieldName("contract")) as string,
    value: parseInt(getValues(genFieldName("value"))),
    input,
  };

  useEffect(() => {
    // clear args of last selected function
    if (functionFragment?.inputs && replace) {
      console.debug(functionFragment);
      replace(functionFragment.inputs.map((p) => ""));
    }
  }, [functionFragment, replace]);

  useEffect(() => {
    // if the function input changed, we need to re-run simulation
    setShouldSimulate(false);
  }, [
    getFieldState(genFieldName("args")).isDirty,
    getValues(genFieldName("functionName")),
  ]);

  function onSimulated(
    data: TenderlySimulationAPIResponse | undefined,
    shouldSimulate: boolean,
  ) {
    const simulationId = data?.simulation?.id;
    const simulationStatus = data?.simulation?.status;

    if (simulationId) {
      setValue(genFieldName("tenderlyId"), simulationId);
    }

    if (shouldSimulate) {
      setValue(
        genFieldName("tenderlyStatus"),
        simulationStatus ? "true" : "false",
      );
    } else {
      setValue(genFieldName("tenderlyStatus"), "false");
    }
  }

  return (
    <div className="grid grid-cols-4 gap-6">
      <TenderlySimulationButton
        simulationArgs={simulateArgs}
        shouldSimulate={!!projectOwner && !!input && !!shouldSimulate}
        setShouldSimulate={setShouldSimulate}
        onSimulated={onSimulated}
      />

      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Contract" fieldName={genFieldName("contract")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <UIntForm label="ETH Value" fieldName={genFieldName("value")} />
      </div>

      {watch(genFieldName("contract"))?.length === 42 && (
        <div className="col-span-4 sm:col-span-2">
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Function
          </label>
          <Controller
            name={genFieldName("functionName")}
            control={control}
            rules={{
              required: "Can't be empty",
            }}
            render={({ field: { onChange, onBlur, value, ref } }) => (
              <FunctionSelector
                address={watch(genFieldName("contract"))}
                val={value}
                setVal={onChange}
                setFunctionFragment={(f) => setFunctionFragment(f)}
                inputStyle="h-10"
              />
            )}
          />
          <ErrorMessage
            errors={errors}
            name={genFieldName("functionName")}
            render={({ message }) => (
              <p className="mt-1 text-red-500">{message}</p>
            )}
          />
        </div>
      )}

      {functionFragment?.inputs?.map((param, index) => (
        <div key={index} className="col-span-4 sm:col-span-1">
          {param.type === "address" && (
            <AddressForm
              label={`Param: ${param.name || "_"}`}
              fieldName={genFieldName(`args.${index}`)}
            />
          )}

          {param.type.includes("int") && (
            <UIntForm
              label={`Param: ${param.name || "_"}`}
              fieldName={genFieldName(`args.${index}`)}
              fieldType={param.type}
            />
          )}

          {param.type === "bool" && (
            <BooleanForm
              label={`Param: ${param.name || "_"}`}
              fieldName={genFieldName(`args.${index}`)}
            />
          )}

          {param.type !== "address" &&
            !param.type.includes("int") &&
            param.type !== "bool" && (
            <StringForm
              label={`Param: ${param.name || "_"}`}
              fieldName={genFieldName(`args.${index}`)}
              fieldType={param.type}
            />
          )}
        </div>
      ))}
    </div>
  );
}
