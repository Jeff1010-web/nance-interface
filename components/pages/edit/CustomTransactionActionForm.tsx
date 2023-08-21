import { ArrowPathIcon, CheckCircleIcon, XCircleIcon, CursorArrowRaysIcon } from "@heroicons/react/24/outline";
import { ErrorMessage } from "@hookform/error-message";
import { FunctionFragment, FormatTypes } from "ethers/lib/utils";
import { Tooltip } from "flowbite-react";
import { useState, useEffect } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { encodeTransactionInput, useTendelySimulate } from "../../../hooks/TenderlyHooks";
import { classNames } from "../../../libs/tailwind";
import AddressForm from "../../form/AddressForm";
import BooleanForm from "../../form/BooleanForm";
import NumberForm from "../../form/NumberForm";
import StringForm from "../../form/StringForm";
import FunctionSelector from "./FunctionSelector";

export default function CustomTransactionActionForm({ genFieldName, projectOwner }:
  { genFieldName: (field: string) => any, projectOwner: string | undefined }) {

  const [functionFragment, setFunctionFragment] = useState<FunctionFragment>();
  const [shouldSimulate, setShouldSimulate] = useState<boolean>();

  const { watch, control, formState: { errors }, getValues, getFieldState, formState: { isDirty }, setValue } = useFormContext();
  const { replace } = useFieldArray<{
    args: any[];
    [key: string]: any;
  }>({ name: genFieldName("args") });

  const args = functionFragment?.inputs?.map((param, index) => getValues(genFieldName(`args.${index}`)));
  const input = encodeTransactionInput(functionFragment?.format(FormatTypes.minimal) || "", args || []);
  const simulateArgs = {
    from: projectOwner || "",
    to: getValues(genFieldName("contract")) as string,
    value: parseInt(getValues(genFieldName("value"))),
    input
  };
  const { data, isLoading, error } = useTendelySimulate(simulateArgs, !!projectOwner && !!input && shouldSimulate);

  console.log("CustomTransactionActionForm.tenderly", 
    {
      args: simulateArgs, 
      formValues: getValues(),
      data: data
    });
  
  useEffect(() => {
    // clear args of last selected function
    if(functionFragment?.inputs && replace) {
      console.debug(functionFragment);
      replace(functionFragment.inputs.map(p => ""));
    }
  }, [functionFragment, replace]);

  useEffect(() => {
    // if the function input changed, we need to re-run simulation
    setShouldSimulate(false);
  }, [getFieldState(genFieldName("args")).isDirty, getValues(genFieldName("functionName"))]);

  useEffect(() => {
    // set simulationId which will be uploaded within action
    const simulationId = data?.simulation?.id;
    if (simulationId) {
      setValue(genFieldName("tenderlyId"), simulationId);
    }
  }, [data]);

  useEffect(() => {
    // save simulation status so we can check when user submit proposals
    const simulationStatus = data?.simulation?.status;
    if (shouldSimulate) {
      setValue(genFieldName("tenderlyStatus"), simulationStatus ? "true" : "false");
    } else {
      setValue(genFieldName("tenderlyStatus"), "false");
    }
  }, [data, shouldSimulate]);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div className="isolate inline-flex rounded-md col-span-4">
        <button
          type="button"
          className={classNames(
            "relative inline-flex items-center gap-x-1.5 rounded-l-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300",
            shouldSimulate ? "" : "hover:bg-gray-50 focus:z-10"
          )}
          onClick={() => {
            if (shouldSimulate) {
              setShouldSimulate(false);
            }
            setShouldSimulate(true);
          }}
        >
          Simulate
        </button>
        <div
          className="relative -ml-px inline-flex items-center rounded-r-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300"
        >
          {shouldSimulate ? 
            (isLoading ? 
              <ArrowPathIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" /> : 
              (data?.simulation?.status ? 
                <CheckCircleIcon className="-ml-0.5 h-5 w-5 text-green-400" aria-hidden="true" /> : 
                <Tooltip content={`Error: ${error ? error.message : (data?.simulation?.error_message || "Not enough args")}`}>
                  <XCircleIcon className="-ml-0.5 h-5 w-5 text-red-400" aria-hidden="true" />
                </Tooltip>
              ) 
            )
            : <CursorArrowRaysIcon className="-ml-0.5 h-5 w-5 text-blue-400" aria-hidden="true" />}
        </div>
      </div>

      <div className="col-span-4 sm:col-span-2">
        <AddressForm label="Contract" fieldName={genFieldName("contract")} />
      </div>

      <div className="col-span-4 sm:col-span-1">
        <NumberForm label="ETH Value" fieldName={genFieldName("value")} />
      </div>

      {
        watch(genFieldName("contract"))?.length === 42 && (
          <div className="col-span-4 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Function
            </label>
            <Controller
              name={genFieldName("functionName")}
              control={control}
              rules={{
                required: "Can't be empty"
              }}
              render={({ field: { onChange, onBlur, value, ref } }) =>
                <FunctionSelector address={watch(genFieldName("contract"))} val={value} setVal={onChange} setFunctionFragment={(f) => setFunctionFragment(f)} inputStyle="h-10" />
              }
            />
            <ErrorMessage
              errors={errors}
              name={genFieldName("functionName")}
              render={({ message }) => <p className="text-red-500 mt-1">{message}</p>}
            />
          </div>
        )
      }

      {
        functionFragment?.inputs?.map((param, index) => (
          <div key={index} className="col-span-4 sm:col-span-1">
            {param.type === "address" && (
              <AddressForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} />
            )}

            {param.type.includes("int") && (
              <NumberForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} fieldType={param.type} />
            )}

            {param.type === "bool" && (
              <BooleanForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} />
            )}

            {param.type !== "address" && !param.type.includes("int") && param.type !== "bool" && (
              <StringForm label={`Param: ${param.name || '_'}`} fieldName={genFieldName(`args.${index}`)} fieldType={param.type} />
            )}
          </div>
        ))
      }

    </div >
  );
}